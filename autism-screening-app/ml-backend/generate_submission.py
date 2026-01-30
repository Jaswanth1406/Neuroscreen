"""
Generate predictions for the test dataset and create submission file
"""

import pandas as pd
import os
from train import load_model, engineer_features, get_feature_columns

def generate_submission():
    # Load model
    model_dir = 'models'
    if not os.path.exists(model_dir):
        print("Model not found. Please run train.py first.")
        return
    
    model_artifacts = load_model(model_dir)
    model = model_artifacts['model']
    scaler = model_artifacts['scaler']
    feature_cols = model_artifacts['feature_cols']
    
    # Load test data
    test_path = '../../dataset/test.csv'
    test_df = pd.read_csv(test_path)
    print(f"Loaded test data: {test_df.shape[0]} samples")
    
    # Add placeholder result column (required for feature engineering)
    test_df['result'] = test_df[[f'A{i}_Score' for i in range(1, 11)]].sum(axis=1)
    
    # Engineer features
    test_features = engineer_features(test_df)
    
    # Prepare features
    X_test = test_features[feature_cols].values
    X_test_scaled = scaler.transform(X_test)
    
    # Make predictions
    predictions = model.predict(X_test_scaled)
    probabilities = model.predict_proba(X_test_scaled)[:, 1]
    
    # Create submission
    submission = pd.DataFrame({
        'ID': test_df['ID'],
        'Class/ASD': predictions
    })
    
    # Save submission
    submission.to_csv('submission.csv', index=False)
    print(f"Submission saved to submission.csv")
    
    # Print statistics
    print(f"\nPrediction Statistics:")
    print(f"Total samples: {len(predictions)}")
    print(f"Predicted ASD: {predictions.sum()} ({predictions.sum()/len(predictions)*100:.1f}%)")
    print(f"Predicted No ASD: {(1-predictions).sum()} ({(1-predictions).sum()/len(predictions)*100:.1f}%)")
    print(f"\nProbability Distribution:")
    print(f"Min: {probabilities.min():.3f}")
    print(f"Max: {probabilities.max():.3f}")
    print(f"Mean: {probabilities.mean():.3f}")
    print(f"Median: {pd.Series(probabilities).median():.3f}")
    
    # Create detailed predictions file
    detailed = pd.DataFrame({
        'ID': test_df['ID'],
        'Prediction': predictions,
        'Probability': probabilities,
        'Risk_Level': pd.cut(probabilities, bins=[0, 0.3, 0.6, 1.0], labels=['Low', 'Medium', 'High']),
        'AQ10_Total': test_features['aq10_total'],
        'Social_Score': test_features['social_score'],
        'Attention_Score': test_features['attention_score']
    })
    detailed.to_csv('detailed_predictions.csv', index=False)
    print(f"\nDetailed predictions saved to detailed_predictions.csv")

if __name__ == '__main__':
    generate_submission()
