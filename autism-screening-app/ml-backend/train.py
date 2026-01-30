"""
ASD Screening Feature Extraction and Model Training
Uses the AQ-10 questionnaire dataset from the dataset folder
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score, brier_score_loss, classification_report, confusion_matrix
import lightgbm as lgb
import joblib
import os
import json

# Feature columns (AQ-10 questionnaire scores)
AQ10_FEATURES = [
    'A1_Score', 'A2_Score', 'A3_Score', 'A4_Score', 'A5_Score',
    'A6_Score', 'A7_Score', 'A8_Score', 'A9_Score', 'A10_Score'
]

# Additional demographic features
DEMOGRAPHIC_FEATURES = ['age', 'gender', 'jaundice', 'austim', 'used_app_before', 'result']

# AQ-10 Question descriptions for interpretability
AQ10_QUESTIONS = {
    'A1_Score': 'I often notice small sounds when others do not',
    'A2_Score': 'I usually concentrate more on the whole picture, rather than small details',
    'A3_Score': 'I find it easy to do more than one thing at once',
    'A4_Score': 'If there is an interruption, I can switch back to what I was doing very quickly',
    'A5_Score': 'I find it easy to read between the lines when someone is talking to me',
    'A6_Score': 'I know how to tell if someone listening to me is getting bored',
    'A7_Score': 'When reading a story, I find it difficult to work out the characters intentions',
    'A8_Score': 'I like to collect information about categories of things',
    'A9_Score': 'I find it easy to work out what someone is thinking or feeling',
    'A10_Score': 'I find it difficult to work out peoples intentions'
}


def load_and_preprocess_data(train_path: str, test_path: str = None):
    """Load and preprocess the ASD screening dataset"""
    
    # Load training data
    train_df = pd.read_csv(train_path)
    print(f"Loaded training data: {train_df.shape[0]} samples")
    
    # Load test data if provided
    test_df = None
    if test_path:
        test_df = pd.read_csv(test_path)
        print(f"Loaded test data: {test_df.shape[0]} samples")
    
    return train_df, test_df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Engineer additional features from the dataset"""
    
    df_features = df.copy()
    
    # Sum of AQ-10 scores (total autism quotient)
    df_features['aq10_total'] = df_features[AQ10_FEATURES].sum(axis=1)
    
    # Communication/Social features (A5, A6, A7, A9, A10)
    social_cols = ['A5_Score', 'A6_Score', 'A7_Score', 'A9_Score', 'A10_Score']
    df_features['social_score'] = df_features[social_cols].sum(axis=1)
    
    # Attention/Detail features (A1, A2, A3, A4, A8)
    attention_cols = ['A1_Score', 'A2_Score', 'A3_Score', 'A4_Score', 'A8_Score']
    df_features['attention_score'] = df_features[attention_cols].sum(axis=1)
    
    # Encode categorical variables
    # Gender
    df_features['gender_encoded'] = (df_features['gender'] == 'm').astype(int)
    
    # Jaundice at birth
    df_features['jaundice_encoded'] = (df_features['jaundice'] == 'yes').astype(int)
    
    # Family history of autism
    df_features['autism_family_encoded'] = (df_features['austim'] == 'yes').astype(int)
    
    # Used screening app before
    df_features['used_app_encoded'] = (df_features['used_app_before'] == 'yes').astype(int)
    
    # Age group (child, teen, adult, senior)
    df_features['age_group'] = pd.cut(
        df_features['age'], 
        bins=[0, 12, 18, 40, 100],
        labels=[0, 1, 2, 3]
    ).astype(int)
    
    # Ethnicity encoding (simplified)
    ethnicity_map = {
        'White-European': 0,
        'Asian': 1,
        'Middle Eastern ': 2,
        'South Asian': 3,
        'Black': 4,
        'Hispanic': 5,
        'Pasifika': 6,
        'Turkish': 7,
        'Others': 8,
        '?': 9
    }
    df_features['ethnicity_encoded'] = df_features['ethnicity'].map(ethnicity_map).fillna(9).astype(int)
    
    return df_features


def get_feature_columns():
    """Get the list of feature columns for the model"""
    return (
        AQ10_FEATURES + 
        ['aq10_total', 'social_score', 'attention_score', 'age',
         'gender_encoded', 'jaundice_encoded', 'autism_family_encoded',
         'used_app_encoded', 'age_group', 'ethnicity_encoded', 'result']
    )


def train_model(train_df: pd.DataFrame, model_type: str = 'lightgbm'):
    """Train the ASD screening model"""
    
    # Engineer features
    train_features = engineer_features(train_df)
    
    # Get feature columns
    feature_cols = get_feature_columns()
    
    # Prepare X and y
    X = train_features[feature_cols].values
    y = train_features['Class/ASD'].values
    
    # Split data
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    
    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Validation set: {X_val.shape[0]} samples")
    print(f"Class distribution - Train: {np.bincount(y_train)}, Val: {np.bincount(y_val)}")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    
    if model_type == 'lightgbm':
        # LightGBM model
        model = lgb.LGBMClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            class_weight='balanced',
            random_state=42,
            verbose=-1
        )
        model.fit(
            X_train_scaled, y_train,
            eval_set=[(X_val_scaled, y_val)],
        )
        
        # Get feature importance
        feature_importance = dict(zip(feature_cols, model.feature_importances_))
        
    else:
        # Logistic Regression with calibration
        base_model = LogisticRegression(
            C=1.0,
            class_weight='balanced',
            solver='liblinear',
            max_iter=200,
            random_state=42
        )
        base_model.fit(X_train_scaled, y_train)
        
        # Calibrate the model
        model = CalibratedClassifierCV(base_model, method='isotonic', cv='prefit')
        model.fit(X_val_scaled, y_val)
        
        # Get feature importance (coefficients)
        feature_importance = dict(zip(feature_cols, np.abs(base_model.coef_[0])))
    
    # Evaluate on validation set
    y_pred_proba = model.predict_proba(X_val_scaled)[:, 1]
    y_pred = model.predict(X_val_scaled)
    
    auc = roc_auc_score(y_val, y_pred_proba)
    brier = brier_score_loss(y_val, y_pred_proba)
    
    print(f"\nValidation Metrics:")
    print(f"AUC-ROC: {auc:.4f}")
    print(f"Brier Score: {brier:.4f}")
    print(f"\nClassification Report:")
    print(classification_report(y_val, y_pred, target_names=['No ASD', 'ASD']))
    print(f"\nConfusion Matrix:")
    print(confusion_matrix(y_val, y_pred))
    
    # Sort feature importance
    sorted_importance = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    print(f"\nTop 10 Feature Importance:")
    for feat, imp in sorted_importance[:10]:
        print(f"  {feat}: {imp:.4f}")
    
    return {
        'model': model,
        'scaler': scaler,
        'feature_cols': feature_cols,
        'feature_importance': feature_importance,
        'metrics': {
            'auc_roc': auc,
            'brier_score': brier
        }
    }


def predict(model_artifacts: dict, input_data: dict) -> dict:
    """Make a prediction for a single sample"""
    
    model = model_artifacts['model']
    scaler = model_artifacts['scaler']
    feature_cols = model_artifacts['feature_cols']
    feature_importance = model_artifacts['feature_importance']
    
    # Create a dataframe from input
    df = pd.DataFrame([input_data])
    
    # Engineer features
    df_features = engineer_features(df)
    
    # Get features
    X = df_features[feature_cols].values
    
    # Scale
    X_scaled = scaler.transform(X)
    
    # Predict
    probability = model.predict_proba(X_scaled)[0, 1]
    prediction = int(probability >= 0.5)
    
    # Get risk level
    if probability < 0.3:
        risk_level = "Low"
    elif probability < 0.6:
        risk_level = "Medium"
    else:
        risk_level = "High"
    
    # Normalize feature importance to percentages (sum to 100%)
    total_importance = sum(feature_importance.values())
    normalized_importance = {k: (v / total_importance) * 100 for k, v in feature_importance.items()}
    
    # Get contributing factors
    contributing_factors = []
    for feat, imp in sorted(normalized_importance.items(), key=lambda x: x[1], reverse=True)[:5]:
        if feat in AQ10_FEATURES:
            question = AQ10_QUESTIONS.get(feat, feat)
            value = input_data.get(feat, 0)
            contributing_factors.append({
                'feature': feat,
                'question': question,
                'value': value,
                'importance': float(imp)
            })
        else:
            value = df_features[feat].values[0]
            contributing_factors.append({
                'feature': feat,
                'question': feat.replace('_', ' ').title(),
                'value': float(value),
                'importance': float(imp)
            })
    
    return {
        'prediction': prediction,
        'probability': float(probability),
        'risk_level': risk_level,
        'contributing_factors': contributing_factors,
        'aq10_total': int(df_features['aq10_total'].values[0]),
        'social_score': int(df_features['social_score'].values[0]),
        'attention_score': int(df_features['attention_score'].values[0])
    }


def save_model(model_artifacts: dict, output_dir: str):
    """Save the trained model and artifacts"""
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Save model
    joblib.dump(model_artifacts['model'], os.path.join(output_dir, 'model.pkl'))
    
    # Save scaler
    joblib.dump(model_artifacts['scaler'], os.path.join(output_dir, 'scaler.pkl'))
    
    # Save feature columns
    with open(os.path.join(output_dir, 'feature_cols.json'), 'w') as f:
        json.dump(model_artifacts['feature_cols'], f)
    
    # Save feature importance (convert numpy types to native Python types)
    feature_importance_serializable = {
        k: float(v) for k, v in model_artifacts['feature_importance'].items()
    }
    with open(os.path.join(output_dir, 'feature_importance.json'), 'w') as f:
        json.dump(feature_importance_serializable, f)
    
    # Save metrics
    with open(os.path.join(output_dir, 'metrics.json'), 'w') as f:
        json.dump(model_artifacts['metrics'], f)
    
    print(f"Model saved to {output_dir}")


def load_model(model_dir: str) -> dict:
    """Load trained model and artifacts"""
    
    model = joblib.load(os.path.join(model_dir, 'model.pkl'))
    scaler = joblib.load(os.path.join(model_dir, 'scaler.pkl'))
    
    with open(os.path.join(model_dir, 'feature_cols.json'), 'r') as f:
        feature_cols = json.load(f)
    
    with open(os.path.join(model_dir, 'feature_importance.json'), 'r') as f:
        feature_importance = json.load(f)
    
    return {
        'model': model,
        'scaler': scaler,
        'feature_cols': feature_cols,
        'feature_importance': feature_importance
    }


if __name__ == '__main__':
    # Train the model
    # Dataset is in the parent hackathon folder: AI WARS 24 HACKATHON/dataset/
    data_dir = '../../dataset'
    train_path = os.path.join(data_dir, 'train.csv')
    
    train_df, _ = load_and_preprocess_data(train_path)
    
    # Train LightGBM model
    print("=" * 50)
    print("Training LightGBM Model")
    print("=" * 50)
    model_artifacts = train_model(train_df, model_type='lightgbm')
    
    # Save model
    save_model(model_artifacts, 'models')
    
    # Test prediction
    print("\n" + "=" * 50)
    print("Testing Prediction")
    print("=" * 50)
    
    test_input = {
        'A1_Score': 1, 'A2_Score': 1, 'A3_Score': 1, 'A4_Score': 1, 'A5_Score': 1,
        'A6_Score': 1, 'A7_Score': 1, 'A8_Score': 1, 'A9_Score': 1, 'A10_Score': 1,
        'age': 25, 'gender': 'm', 'ethnicity': 'White-European',
        'jaundice': 'no', 'austim': 'yes', 'used_app_before': 'no', 'result': 10
    }
    
    result = predict(model_artifacts, test_input)
    print(f"Prediction: {'ASD' if result['prediction'] == 1 else 'No ASD'}")
    print(f"Probability: {result['probability']:.2%}")
    print(f"Risk Level: {result['risk_level']}")
    print(f"AQ-10 Total: {result['aq10_total']}")
    print(f"Social Score: {result['social_score']}")
    print(f"Attention Score: {result['attention_score']}")
