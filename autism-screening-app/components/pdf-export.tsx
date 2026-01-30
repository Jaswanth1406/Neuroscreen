"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import type { ScreeningResult } from "@/app/page"

interface PDFExportProps {
  result: ScreeningResult
  userName?: string
}

export function PDFExport({ result, userName }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)

    try {
      // Create a printable HTML content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>NeuroScreen - Screening Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #1e293b;
              padding: 40px;
              background: white;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo { font-size: 28px; font-weight: bold; color: #3b82f6; }
            .logo span { color: #8b5cf6; }
            .date { color: #64748b; font-size: 14px; }
            .section { margin-bottom: 30px; }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              color: #1e293b;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 1px solid #e2e8f0;
            }
            .risk-badge {
              display: inline-block;
              padding: 8px 20px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 16px;
            }
            .risk-low { background: #dcfce7; color: #166534; }
            .risk-medium { background: #fef3c7; color: #92400e; }
            .risk-high { background: #fee2e2; color: #991b1b; }
            .score-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-top: 20px;
            }
            .score-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 20px;
              text-align: center;
            }
            .score-value {
              font-size: 36px;
              font-weight: bold;
              color: #3b82f6;
            }
            .score-label { color: #64748b; margin-top: 8px; }
            .progress-bar {
              width: 100%;
              height: 8px;
              background: #e2e8f0;
              border-radius: 4px;
              margin-top: 10px;
              overflow: hidden;
            }
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #3b82f6, #8b5cf6);
              border-radius: 4px;
            }
            .factors-list { list-style: none; }
            .factors-list li {
              padding: 12px 15px;
              background: #f8fafc;
              border-radius: 8px;
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .factor-badge {
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
            }
            .factor-present { background: #dbeafe; color: #1d4ed8; }
            .factor-absent { background: #f1f5f9; color: #64748b; }
            .disclaimer {
              background: #fefce8;
              border: 1px solid #fde047;
              border-radius: 12px;
              padding: 20px;
              margin-top: 30px;
            }
            .disclaimer-title { color: #a16207; font-weight: 600; margin-bottom: 10px; }
            .disclaimer-text { color: #854d0e; font-size: 14px; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              color: #94a3b8;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Neuro<span>Screen</span></div>
            <div class="date">
              Report Generated: ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          ${userName ? `<p style="margin-bottom: 20px;">Participant: <strong>${userName}</strong></p>` : ''}

          <div class="section">
            <div class="section-title">Screening Risk Assessment</div>
            <div style="display: flex; align-items: center; gap: 20px;">
              <span class="risk-badge risk-${result.risk_level.toLowerCase()}">${result.risk_level} Risk</span>
              <span>Confidence Score: <strong>${(result.probability * 100).toFixed(1)}%</strong></span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Score Breakdown</div>
            <div class="score-grid">
              <div class="score-card">
                <div class="score-value">${result.aq10_total}<span style="font-size: 18px; color: #94a3b8;">/10</span></div>
                <div class="score-label">AQ-10 Total Score</div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${(result.aq10_total / 10) * 100}%"></div>
                </div>
              </div>
              <div class="score-card">
                <div class="score-value" style="color: #3b82f6;">${result.social_score}<span style="font-size: 18px; color: #94a3b8;">/5</span></div>
                <div class="score-label">Social Communication</div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${(result.social_score / 5) * 100}%"></div>
                </div>
              </div>
              <div class="score-card">
                <div class="score-value" style="color: #8b5cf6;">${result.attention_score}<span style="font-size: 18px; color: #94a3b8;">/5</span></div>
                <div class="score-label">Attention & Detail</div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${(result.attention_score / 5) * 100}%"></div>
                </div>
              </div>
            </div>
          </div>

          ${result.contributing_factors && result.contributing_factors.length > 0 ? `
          <div class="section">
            <div class="section-title">Key Contributing Factors</div>
            <ul class="factors-list">
              ${result.contributing_factors.map((factor, index) => `
                <li>
                  <span><strong>${index + 1}.</strong> ${factor.question}</span>
                  <span class="factor-badge ${factor.value === 1 ? 'factor-present' : 'factor-absent'}">
                    ${factor.value === 1 ? 'Present' : 'Absent'} (${factor.importance.toFixed(1)}%)
                  </span>
                </li>
              `).join('')}
            </ul>
          </div>
          ` : ''}

          ${result.recommendations && result.recommendations.length > 0 ? `
          <div class="section">
            <div class="section-title">Recommendations</div>
            <ul style="padding-left: 20px;">
              ${result.recommendations.map(rec => `<li style="margin-bottom: 8px;">${rec}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <div class="disclaimer">
            <div class="disclaimer-title">⚠️ Important Disclaimer</div>
            <div class="disclaimer-text">
              This screening tool is designed to identify individuals who may benefit from a comprehensive 
              diagnostic evaluation. It is NOT a diagnostic instrument. A positive result on this screener 
              does not mean that the individual has Autism Spectrum Disorder (ASD). Only a qualified healthcare 
              professional can provide a formal diagnosis after comprehensive evaluation.
            </div>
          </div>

          <div class="footer">
            <p>NeuroScreen - AI-Powered Autism Screening Support Tool</p>
            <p>This report is confidential and intended for the recipient only.</p>
          </div>
        </body>
        </html>
      `

      // Open in new window for printing
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(printContent)
        printWindow.document.close()
        
        // Wait for content to load then print
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      variant="outline"
      className="gap-2"
      aria-label="Export screening results as PDF"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  )
}
