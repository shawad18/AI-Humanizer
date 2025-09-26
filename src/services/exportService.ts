export interface ExportOptions {
  format: 'txt' | 'docx' | 'pdf' | 'html' | 'latex' | 'markdown' | 'rtf';
  filename?: string;
  includeMetadata?: boolean;
  includeAnalysis?: boolean;
  includeVersionHistory?: boolean;
  customStyling?: {
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
    margins?: { top: number; right: number; bottom: number; left: number };
    headerFooter?: boolean;
  };
  watermark?: {
    text: string;
    opacity?: number;
    position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  passwordProtection?: {
    enabled: boolean;
    password?: string;
  };
  compression?: boolean;
  pageBreaks?: boolean;
  tableOfContents?: boolean;
}

export interface ExportData {
  originalText: string;
  humanizedText: string;
  settings: any;
  detectionResult?: any;
  timestamp: string;
  documentId?: string;
  title?: string;
  author?: string;
  tags?: string[];
  versionHistory?: Array<{
    version: number;
    text: string;
    timestamp: string;
    changes: string;
  }>;
  collaborators?: Array<{
    name: string;
    email: string;
    role: string;
  }>;
  wordCount?: number;
  characterCount?: number;
  readingTime?: number;
}

export class ExportService {
  static async exportText(data: ExportData, options: ExportOptions): Promise<void> {
    const filename = options.filename || `humanized-text-${Date.now()}`;
    
    switch (options.format) {
      case 'txt':
        await this.exportAsTxt(data, filename, options);
        break;
      case 'html':
        await this.exportAsHtml(data, filename, options);
        break;
      case 'docx':
        await this.exportAsDocx(data, filename, options);
        break;
      case 'pdf':
        await this.exportAsPdf(data, filename, options);
        break;
      case 'latex':
        await this.exportAsLatex(data, filename, options);
        break;
      case 'markdown':
        await this.exportAsMarkdown(data, filename, options);
        break;
      case 'rtf':
        await this.exportAsRtf(data, filename, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private static async exportAsTxt(data: ExportData, filename: string, options: ExportOptions): Promise<void> {
    let content = '';
    
    if (options.includeMetadata) {
      content += `AI Text Humanizer Export\n`;
      content += `Generated: ${data.timestamp}\n`;
      content += `${'='.repeat(50)}\n\n`;
    }
    
    if (data.originalText && options.includeAnalysis) {
      content += `ORIGINAL TEXT:\n`;
      content += `${'-'.repeat(20)}\n`;
      content += `${data.originalText}\n\n`;
    }
    
    content += `HUMANIZED TEXT:\n`;
    content += `${'-'.repeat(20)}\n`;
    content += `${data.humanizedText}\n\n`;
    
    if (options.includeAnalysis && data.detectionResult) {
      content += `ANALYSIS RESULTS:\n`;
      content += `${'-'.repeat(20)}\n`;
      content += `AI Detection Score: ${(data.detectionResult.aiDetectionScore * 100).toFixed(1)}%\n`;
      content += `Plagiarism Risk: ${data.detectionResult.plagiarismRisk}\n`;
      content += `Readability Score: ${data.detectionResult.readabilityScore.toFixed(1)}\n`;
      content += `Uniqueness Score: ${(data.detectionResult.uniquenessScore * 100).toFixed(1)}%\n\n`;
      
      if (data.detectionResult.recommendations?.length > 0) {
        content += `RECOMMENDATIONS:\n`;
        data.detectionResult.recommendations.forEach((rec: string, index: number) => {
          content += `${index + 1}. ${rec}\n`;
        });
      }
    }
    
    this.downloadFile(content, `${filename}.txt`, 'text/plain');
  }

  private static async exportAsHtml(data: ExportData, filename: string, options: ExportOptions): Promise<void> {
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Text Humanizer Export</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #1976d2;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border-radius: 8px;
            background-color: #f5f5f5;
        }
        .section h2 {
            color: #1976d2;
            margin-top: 0;
        }
        .text-content {
            background-color: white;
            padding: 15px;
            border-radius: 4px;
            border-left: 4px solid #1976d2;
            white-space: pre-wrap;
        }
        .metadata {
            font-size: 0.9em;
            color: #666;
        }
        .analysis-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .metric {
            background-color: white;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
        }
        .metric-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #1976d2;
        }
        .recommendations {
            background-color: white;
            padding: 15px;
            border-radius: 4px;
            margin-top: 15px;
        }
        .recommendations ul {
            margin: 0;
            padding-left: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>AI Text Humanizer Export</h1>`;
    
    if (options.includeMetadata) {
      html += `<p class="metadata">Generated: ${data.timestamp}</p>`;
    }
    
    html += `</div>`;
    
    if (data.originalText && options.includeAnalysis) {
      html += `
    <div class="section">
        <h2>Original Text</h2>
        <div class="text-content">${this.escapeHtml(data.originalText)}</div>
    </div>`;
    }
    
    html += `
    <div class="section">
        <h2>Humanized Text</h2>
        <div class="text-content">${this.escapeHtml(data.humanizedText)}</div>
    </div>`;
    
    if (options.includeAnalysis && data.detectionResult) {
      html += `
    <div class="section">
        <h2>Analysis Results</h2>
        <div class="analysis-grid">
            <div class="metric">
                <div class="metric-value">${(data.detectionResult.aiDetectionScore * 100).toFixed(1)}%</div>
                <div>AI Detection Score</div>
            </div>
            <div class="metric">
                <div class="metric-value">${data.detectionResult.plagiarismRisk}</div>
                <div>Plagiarism Risk</div>
            </div>
            <div class="metric">
                <div class="metric-value">${data.detectionResult.readabilityScore.toFixed(1)}</div>
                <div>Readability Score</div>
            </div>
            <div class="metric">
                <div class="metric-value">${(data.detectionResult.uniquenessScore * 100).toFixed(1)}%</div>
                <div>Uniqueness Score</div>
            </div>
        </div>`;
      
      if (data.detectionResult.recommendations?.length > 0) {
        html += `
        <div class="recommendations">
            <h3>Recommendations</h3>
            <ul>`;
        data.detectionResult.recommendations.forEach((rec: string) => {
          html += `<li>${this.escapeHtml(rec)}</li>`;
        });
        html += `</ul></div>`;
      }
      
      html += `</div>`;
    }
    
    html += `
</body>
</html>`;
    
    this.downloadFile(html, `${filename}.html`, 'text/html');
  }

  private static async exportAsDocx(data: ExportData, filename: string, options: ExportOptions): Promise<void> {
    // For DOCX export, we'll create a simple XML-based document
    // In a real implementation, you might use a library like docx or mammoth
    const content = this.createDocxContent(data, options);
    this.downloadFile(content, `${filename}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  }

  private static async exportAsPdf(data: ExportData, filename: string, options: ExportOptions): Promise<void> {
    // For PDF export, we'll use the browser's print functionality
    // In a real implementation, you might use a library like jsPDF or Puppeteer
    const htmlContent = await this.createPdfHtml(data, options);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Trigger print dialog
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  private static createDocxContent(data: ExportData, options: ExportOptions): string {
    // Simplified DOCX structure - in production, use a proper DOCX library
    let content = data.humanizedText;
    
    if (options.includeMetadata) {
      content = `AI Text Humanizer Export\nGenerated: ${data.timestamp}\n\n${content}`;
    }
    
    return content;
  }

  private static createPdfHtml(data: ExportData, options: ExportOptions): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>AI Text Humanizer Export</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #333;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
        }
        .text-content {
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>AI Text Humanizer Export</h1>
        ${options.includeMetadata ? `<p>Generated: ${data.timestamp}</p>` : ''}
    </div>
    
    ${data.originalText && options.includeAnalysis ? `
    <div class="section">
        <h2>Original Text</h2>
        <div class="text-content">${this.escapeHtml(data.originalText)}</div>
    </div>` : ''}
    
    <div class="section">
        <h2>Humanized Text</h2>
        <div class="text-content">${this.escapeHtml(data.humanizedText)}</div>
    </div>
    
    <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()">Print / Save as PDF</button>
        <button onclick="window.close()">Close</button>
    </div>
</body>
</html>`;
  }

  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  private static async exportAsLatex(data: ExportData, filename: string, options: ExportOptions): Promise<void> {
    let latex = `\\documentclass[12pt,a4paper]{article}\n`;
    latex += `\\usepackage[utf8]{inputenc}\n`;
    latex += `\\usepackage[T1]{fontenc}\n`;
    latex += `\\usepackage{geometry}\n`;
    latex += `\\usepackage{fancyhdr}\n`;
    latex += `\\usepackage{hyperref}\n`;
    latex += `\\usepackage{xcolor}\n`;
    
    if (options.customStyling?.margins) {
      const m = options.customStyling.margins;
      latex += `\\geometry{top=${m.top}cm,right=${m.right}cm,bottom=${m.bottom}cm,left=${m.left}cm}\n`;
    }
    
    if (options.watermark) {
      latex += `\\usepackage{draftwatermark}\n`;
      latex += `\\SetWatermarkText{${options.watermark.text}}\n`;
      latex += `\\SetWatermarkScale{0.5}\n`;
    }
    
    latex += `\n\\title{${data.title || 'AI Text Humanizer Export'}}\n`;
    latex += `\\author{${data.author || 'AI Humanizer'}}\n`;
    latex += `\\date{${new Date(data.timestamp).toLocaleDateString()}}\n\n`;
    
    latex += `\\begin{document}\n\n`;
    latex += `\\maketitle\n\n`;
    
    if (options.tableOfContents) {
      latex += `\\tableofcontents\n\\newpage\n\n`;
    }
    
    if (options.includeMetadata) {
      latex += `\\section{Document Information}\n`;
      latex += `\\begin{itemize}\n`;
      latex += `\\item Generated: ${data.timestamp}\n`;
      if (data.wordCount) latex += `\\item Word Count: ${data.wordCount}\n`;
      if (data.characterCount) latex += `\\item Character Count: ${data.characterCount}\n`;
      if (data.readingTime) latex += `\\item Reading Time: ${data.readingTime} minutes\n`;
      latex += `\\end{itemize}\n\n`;
    }
    
    if (data.originalText && options.includeAnalysis) {
      latex += `\\section{Original Text}\n`;
      latex += `\\begin{quote}\n${this.escapeLatex(data.originalText)}\n\\end{quote}\n\n`;
    }
    
    latex += `\\section{Humanized Text}\n`;
    latex += `${this.escapeLatex(data.humanizedText)}\n\n`;
    
    if (options.includeAnalysis && data.detectionResult) {
      latex += `\\section{Analysis Results}\n`;
      latex += `\\begin{itemize}\n`;
      latex += `\\item AI Detection Score: ${(data.detectionResult.aiDetectionScore * 100).toFixed(1)}\\%\n`;
      latex += `\\item Plagiarism Risk: ${data.detectionResult.plagiarismRisk}\n`;
      latex += `\\item Readability Score: ${data.detectionResult.readabilityScore.toFixed(1)}\n`;
      latex += `\\item Uniqueness Score: ${(data.detectionResult.uniquenessScore * 100).toFixed(1)}\\%\n`;
      latex += `\\end{itemize}\n\n`;
    }
    
    if (options.includeVersionHistory && data.versionHistory) {
      latex += `\\section{Version History}\n`;
      latex += `\\begin{enumerate}\n`;
      data.versionHistory.forEach(version => {
        latex += `\\item Version ${version.version} (${version.timestamp}): ${this.escapeLatex(version.changes)}\n`;
      });
      latex += `\\end{enumerate}\n\n`;
    }
    
    latex += `\\end{document}`;
    
    this.downloadFile(latex, `${filename}.tex`, 'application/x-latex');
  }

  private static async exportAsMarkdown(data: ExportData, filename: string, options: ExportOptions): Promise<void> {
    let markdown = `# ${data.title || 'AI Text Humanizer Export'}\n\n`;
    
    if (options.includeMetadata) {
      markdown += `## Document Information\n\n`;
      markdown += `- **Generated:** ${data.timestamp}\n`;
      if (data.author) markdown += `- **Author:** ${data.author}\n`;
      if (data.wordCount) markdown += `- **Word Count:** ${data.wordCount}\n`;
      if (data.characterCount) markdown += `- **Character Count:** ${data.characterCount}\n`;
      if (data.readingTime) markdown += `- **Reading Time:** ${data.readingTime} minutes\n`;
      if (data.tags?.length) markdown += `- **Tags:** ${data.tags.join(', ')}\n`;
      markdown += `\n`;
    }
    
    if (data.originalText && options.includeAnalysis) {
      markdown += `## Original Text\n\n`;
      markdown += `> ${data.originalText.replace(/\n/g, '\n> ')}\n\n`;
    }
    
    markdown += `## Humanized Text\n\n`;
    markdown += `${data.humanizedText}\n\n`;
    
    if (options.includeAnalysis && data.detectionResult) {
      markdown += `## Analysis Results\n\n`;
      markdown += `| Metric | Score |\n`;
      markdown += `|--------|-------|\n`;
      markdown += `| AI Detection Score | ${(data.detectionResult.aiDetectionScore * 100).toFixed(1)}% |\n`;
      markdown += `| Plagiarism Risk | ${data.detectionResult.plagiarismRisk} |\n`;
      markdown += `| Readability Score | ${data.detectionResult.readabilityScore.toFixed(1)} |\n`;
      markdown += `| Uniqueness Score | ${(data.detectionResult.uniquenessScore * 100).toFixed(1)}% |\n\n`;
      
      if (data.detectionResult.recommendations?.length > 0) {
        markdown += `### Recommendations\n\n`;
        data.detectionResult.recommendations.forEach((rec: string, index: number) => {
          markdown += `${index + 1}. ${rec}\n`;
        });
        markdown += `\n`;
      }
    }
    
    if (options.includeVersionHistory && data.versionHistory) {
      markdown += `## Version History\n\n`;
      data.versionHistory.forEach(version => {
        markdown += `### Version ${version.version}\n`;
        markdown += `**Date:** ${version.timestamp}\n`;
        markdown += `**Changes:** ${version.changes}\n\n`;
      });
    }
    
    if (data.collaborators?.length) {
      markdown += `## Collaborators\n\n`;
      data.collaborators.forEach(collab => {
        markdown += `- **${collab.name}** (${collab.email}) - ${collab.role}\n`;
      });
      markdown += `\n`;
    }
    
    this.downloadFile(markdown, `${filename}.md`, 'text/markdown');
  }

  private static async exportAsRtf(data: ExportData, filename: string, options: ExportOptions): Promise<void> {
    let rtf = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}`;
    
    if (options.customStyling?.fontSize) {
      rtf += `\\fs${options.customStyling.fontSize * 2}`;
    } else {
      rtf += `\\fs24`;
    }
    
    rtf += `\\f0 `;
    
    if (data.title) {
      rtf += `{\\b\\fs32 ${data.title}}\\par\\par`;
    }
    
    if (options.includeMetadata) {
      rtf += `{\\b Document Information}\\par`;
      rtf += `Generated: ${data.timestamp}\\par`;
      if (data.author) rtf += `Author: ${data.author}\\par`;
      if (data.wordCount) rtf += `Word Count: ${data.wordCount}\\par`;
      rtf += `\\par`;
    }
    
    if (data.originalText && options.includeAnalysis) {
      rtf += `{\\b Original Text}\\par`;
      rtf += `${this.escapeRtf(data.originalText)}\\par\\par`;
    }
    
    rtf += `{\\b Humanized Text}\\par`;
    rtf += `${this.escapeRtf(data.humanizedText)}\\par\\par`;
    
    if (options.includeAnalysis && data.detectionResult) {
      rtf += `{\\b Analysis Results}\\par`;
      rtf += `AI Detection Score: ${(data.detectionResult.aiDetectionScore * 100).toFixed(1)}%\\par`;
      rtf += `Plagiarism Risk: ${data.detectionResult.plagiarismRisk}\\par`;
      rtf += `Readability Score: ${data.detectionResult.readabilityScore.toFixed(1)}\\par`;
      rtf += `Uniqueness Score: ${(data.detectionResult.uniquenessScore * 100).toFixed(1)}%\\par`;
    }
    
    if (options.watermark) {
      rtf += `\\par{\\i\\cf1 ${options.watermark.text}}`;
    }
    
    rtf += `}`;
    
    this.downloadFile(rtf, `${filename}.rtf`, 'application/rtf');
  }

  private static escapeLatex(text: string): string {
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/[{}]/g, '\\$&')
      .replace(/[$&%#^_~]/g, '\\$&')
      .replace(/\n\n/g, '\n\n\\par ')
      .replace(/\n/g, '\\\\\n');
  }

  private static escapeRtf(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}')
      .replace(/\n/g, '\\par ');
  }

  static getSupportedFormats(): Array<{value: string, label: string, description: string}> {
    return [
      {
        value: 'txt',
        label: 'Plain Text (.txt)',
        description: 'Simple text format, compatible with all text editors'
      },
      {
        value: 'html',
        label: 'HTML Document (.html)',
        description: 'Web page format with styling and formatting'
      },
      {
        value: 'docx',
        label: 'Word Document (.docx)',
        description: 'Microsoft Word compatible format'
      },
      {
        value: 'pdf',
        label: 'PDF Document (.pdf)',
        description: 'Portable document format (via print dialog)'
      },
      {
        value: 'latex',
        label: 'LaTeX Document (.tex)',
        description: 'Professional typesetting format for academic papers'
      },
      {
        value: 'markdown',
        label: 'Markdown (.md)',
        description: 'Lightweight markup language for documentation'
      },
      {
        value: 'rtf',
        label: 'Rich Text Format (.rtf)',
        description: 'Cross-platform rich text format'
      }
    ];
  }

  static getAdvancedOptions(): Array<{key: string, label: string, type: string, description: string}> {
    return [
      {
        key: 'includeMetadata',
        label: 'Include Metadata',
        type: 'boolean',
        description: 'Add document information and generation details'
      },
      {
        key: 'includeAnalysis',
        label: 'Include Analysis',
        type: 'boolean',
        description: 'Add AI detection and analysis results'
      },
      {
        key: 'includeVersionHistory',
        label: 'Include Version History',
        type: 'boolean',
        description: 'Add document version history and changes'
      },
      {
        key: 'tableOfContents',
        label: 'Table of Contents',
        type: 'boolean',
        description: 'Generate table of contents (LaTeX/PDF only)'
      },
      {
        key: 'pageBreaks',
        label: 'Page Breaks',
        type: 'boolean',
        description: 'Add page breaks between sections'
      },
      {
        key: 'watermark',
        label: 'Watermark Text',
        type: 'string',
        description: 'Add watermark text to the document'
      },
      {
        key: 'compression',
        label: 'Compress Output',
        type: 'boolean',
        description: 'Compress the exported file'
      }
    ];
  }
}