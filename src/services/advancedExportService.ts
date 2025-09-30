// Advanced Export Service with LaTeX, Markdown, and Bulk Export
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';

export interface ExportOptions {
  format: 'txt' | 'pdf' | 'docx' | 'latex' | 'markdown' | 'html' | 'rtf' | 'json';
  includeMetadata?: boolean;
  includeAnalysis?: boolean;
  customTemplate?: string;
  styling?: {
    fontSize?: number;
    fontFamily?: string;
    lineHeight?: number;
    margins?: { top: number; right: number; bottom: number; left: number };
  };
  watermark?: string;
  password?: string;
}

export interface BulkExportOptions extends ExportOptions {
  documents: Array<{
    id: string;
    title: string;
    content: string;
    metadata?: any;
  }>;
  zipFileName?: string;
  includeIndex?: boolean;
}

export interface ExportResult {
  success: boolean;
  fileName?: string;
  blob?: Blob;
  error?: string;
  metadata?: {
    fileSize: number;
    exportTime: string;
    format: string;
  };
}

class AdvancedExportService {
  private defaultStyling = {
    fontSize: 12,
    fontFamily: 'Times New Roman',
    lineHeight: 1.5,
    margins: { top: 72, right: 72, bottom: 72, left: 72 } // 1 inch in points
  };

  // Single document export
  public async exportDocument(
    title: string,
    content: string,
    options: ExportOptions,
    metadata?: any
  ): Promise<ExportResult> {
    const startTime = Date.now();

    try {
      let blob: Blob;
      let fileName: string;

      switch (options.format) {
        case 'txt':
          ({ blob, fileName } = await this.exportToText(title, content, options));
          break;
        case 'pdf':
          ({ blob, fileName } = await this.exportToPDF(title, content, options, metadata));
          break;
        case 'docx':
          ({ blob, fileName } = await this.exportToDocx(title, content, options, metadata));
          break;
        case 'latex':
          ({ blob, fileName } = await this.exportToLaTeX(title, content, options, metadata));
          break;
        case 'markdown':
          ({ blob, fileName } = await this.exportToMarkdown(title, content, options, metadata));
          break;
        case 'html':
          ({ blob, fileName } = await this.exportToHTML(title, content, options, metadata));
          break;
        case 'rtf':
          ({ blob, fileName } = await this.exportToRTF(title, content, options));
          break;
        case 'json':
          ({ blob, fileName } = await this.exportToJSON(title, content, options, metadata));
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      // Save file
      saveAs(blob, fileName);

      const exportTime = Date.now() - startTime;

      return {
        success: true,
        fileName,
        blob,
        metadata: {
          fileSize: blob.size,
          exportTime: `${exportTime}ms`,
          format: options.format
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  // Bulk export
  public async bulkExport(options: BulkExportOptions): Promise<ExportResult> {
    const startTime = Date.now();

    try {
      const zip = new JSZip();
      const zipFileName = options.zipFileName || `ai-humanizer-export-${Date.now()}.zip`;

      // Create index file if requested
      if (options.includeIndex) {
        const indexContent = this.generateIndexFile(options.documents, options.format);
        zip.file(`index.${this.getFileExtension(options.format)}`, indexContent);
      }

      // Export each document
      for (const doc of options.documents) {
        const result = await this.exportSingleDocumentToBlob(
          doc.title,
          doc.content,
          options,
          doc.metadata
        );

        if (result.success && result.blob) {
          const fileName = `${this.sanitizeFileName(doc.title)}.${this.getFileExtension(options.format)}`;
          zip.file(fileName, result.blob);
        }
      }

      // Generate ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, zipFileName);

      const exportTime = Date.now() - startTime;

      return {
        success: true,
        fileName: zipFileName,
        blob: zipBlob,
        metadata: {
          fileSize: zipBlob.size,
          exportTime: `${exportTime}ms`,
          format: 'zip'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bulk export failed'
      };
    }
  }

  // Format-specific export methods
  private async exportToText(
    title: string,
    content: string,
    options: ExportOptions
  ): Promise<{ blob: Blob; fileName: string }> {
    let textContent = '';

    if (options.includeMetadata) {
      textContent += `Title: ${title}\n`;
      textContent += `Exported: ${new Date().toISOString()}\n`;
      textContent += `Format: Plain Text\n`;
      textContent += '\n' + '='.repeat(50) + '\n\n';
    }

    textContent += content;

    if (options.watermark) {
      textContent += `\n\n---\n${options.watermark}`;
    }

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const fileName = `${this.sanitizeFileName(title)}.txt`;

    return { blob, fileName };
  }

  private async exportToPDF(
    title: string,
    content: string,
    options: ExportOptions,
    metadata?: any
  ): Promise<{ blob: Blob; fileName: string }> {
    const pdf = new jsPDF();
    const styling = { ...this.defaultStyling, ...options.styling };

    // Set font
    pdf.setFont(styling.fontFamily.toLowerCase().replace(/\s/g, ''));
    pdf.setFontSize(styling.fontSize);

    // Add title
    pdf.setFontSize(16);
    pdf.text(title, 20, 30);

    // Add metadata if requested
    let yPosition = 50;
    if (options.includeMetadata && metadata) {
      pdf.setFontSize(10);
      pdf.text(`Exported: ${new Date().toLocaleString()}`, 20, yPosition);
      yPosition += 10;
      if (metadata.humanizationScore) {
        pdf.text(`Humanization Score: ${metadata.humanizationScore}%`, 20, yPosition);
        yPosition += 10;
      }
      yPosition += 10;
    }

    // Add content
    pdf.setFontSize(styling.fontSize);
    const lines = pdf.splitTextToSize(content, 170);
    pdf.text(lines, 20, yPosition);

    // Add watermark if specified
    if (options.watermark) {
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(options.watermark, 20, pdf.internal.pageSize.height - 20);
    }

    const pdfBlob = pdf.output('blob');
    const fileName = `${this.sanitizeFileName(title)}.pdf`;

    return { blob: pdfBlob, fileName };
  }

  private async exportToDocx(
    title: string,
    content: string,
    options: ExportOptions,
    metadata?: any
  ): Promise<{ blob: Blob; fileName: string }> {
    const children: any[] = [];

    // Add title
    children.push(
      new Paragraph({
        children: [new TextRun({ text: title, bold: true, size: 32 })],
        heading: HeadingLevel.TITLE,
      })
    );

    // Add metadata if requested
    if (options.includeMetadata && metadata) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Exported: ${new Date().toLocaleString()}`, italics: true }),
          ],
        })
      );
      
      if (metadata.humanizationScore) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Humanization Score: ${metadata.humanizationScore}%`, italics: true }),
            ],
          })
        );
      }
      
      children.push(new Paragraph({ children: [new TextRun({ text: '' })] })); // Empty line
    }

    // Add content paragraphs
    const paragraphs = content.split('\n\n');
    paragraphs.forEach(paragraph => {
      if (paragraph.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: paragraph.trim() })],
          })
        );
      }
    });

    // Add watermark if specified
    if (options.watermark) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: options.watermark, italics: true, size: 16 })],
        })
      );
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `${this.sanitizeFileName(title)}.docx`;

    return { blob, fileName };
  }

  private async exportToLaTeX(
    title: string,
    content: string,
    options: ExportOptions,
    metadata?: any
  ): Promise<{ blob: Blob; fileName: string }> {
    let latexContent = '';

    // Document class and packages
    latexContent += '\\documentclass[12pt,a4paper]{article}\n';
    latexContent += '\\usepackage[utf8]{inputenc}\n';
    latexContent += '\\usepackage[T1]{fontenc}\n';
    latexContent += '\\usepackage{geometry}\n';
    latexContent += '\\usepackage{setspace}\n';
    latexContent += '\\usepackage{fancyhdr}\n';
    latexContent += '\\usepackage{lastpage}\n';
    latexContent += '\n';

    // Page setup
    const margins = options.styling?.margins || this.defaultStyling.margins;
    latexContent += `\\geometry{top=${margins.top}pt,right=${margins.right}pt,bottom=${margins.bottom}pt,left=${margins.left}pt}\n`;
    latexContent += `\\setstretch{${options.styling?.lineHeight || this.defaultStyling.lineHeight}}\n`;
    latexContent += '\n';

    // Header and footer
    if (options.watermark) {
      latexContent += '\\pagestyle{fancy}\n';
      latexContent += '\\fancyhf{}\n';
      latexContent += `\\fancyfoot[C]{${this.escapeLatex(options.watermark)} - Page \\thepage\\ of \\pageref{LastPage}}\n`;
      latexContent += '\n';
    }

    // Document begin
    latexContent += '\\begin{document}\n\n';

    // Title
    latexContent += `\\title{${this.escapeLatex(title)}}\n`;
    if (options.includeMetadata) {
      latexContent += `\\author{AI Humanizer}\n`;
      latexContent += `\\date{${new Date().toLocaleDateString()}}\n`;
    } else {
      latexContent += '\\date{}\n';
    }
    latexContent += '\\maketitle\n\n';

    // Metadata section
    if (options.includeMetadata && metadata) {
      latexContent += '\\section*{Document Information}\n';
      latexContent += '\\begin{itemize}\n';
      latexContent += `\\item Exported: ${new Date().toLocaleString()}\n`;
      if (metadata.humanizationScore) {
        latexContent += `\\item Humanization Score: ${metadata.humanizationScore}\\%\n`;
      }
      if (metadata.originalLength) {
        latexContent += `\\item Original Length: ${metadata.originalLength} characters\n`;
      }
      if (metadata.processedLength) {
        latexContent += `\\item Processed Length: ${metadata.processedLength} characters\n`;
      }
      latexContent += '\\end{itemize}\n\n';
    }

    // Content
    const paragraphs = content.split('\n\n');
    paragraphs.forEach(paragraph => {
      if (paragraph.trim()) {
        latexContent += `${this.escapeLatex(paragraph.trim())}\n\n`;
      }
    });

    // Document end
    latexContent += '\\end{document}\n';

    const blob = new Blob([latexContent], { type: 'text/plain;charset=utf-8' });
    const fileName = `${this.sanitizeFileName(title)}.tex`;

    return { blob, fileName };
  }

  private async exportToMarkdown(
    title: string,
    content: string,
    options: ExportOptions,
    metadata?: any
  ): Promise<{ blob: Blob; fileName: string }> {
    let markdownContent = '';

    // Title
    markdownContent += `# ${title}\n\n`;

    // Metadata
    if (options.includeMetadata && metadata) {
      markdownContent += '## Document Information\n\n';
      markdownContent += `- **Exported:** ${new Date().toLocaleString()}\n`;
      if (metadata.humanizationScore) {
        markdownContent += `- **Humanization Score:** ${metadata.humanizationScore}%\n`;
      }
      if (metadata.originalLength) {
        markdownContent += `- **Original Length:** ${metadata.originalLength} characters\n`;
      }
      if (metadata.processedLength) {
        markdownContent += `- **Processed Length:** ${metadata.processedLength} characters\n`;
      }
      markdownContent += '\n---\n\n';
    }

    // Content
    markdownContent += content;

    // Watermark
    if (options.watermark) {
      markdownContent += `\n\n---\n\n*${options.watermark}*\n`;
    }

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const fileName = `${this.sanitizeFileName(title)}.md`;

    return { blob, fileName };
  }

  private async exportToHTML(
    title: string,
    content: string,
    options: ExportOptions,
    metadata?: any
  ): Promise<{ blob: Blob; fileName: string }> {
    const styling = { ...this.defaultStyling, ...options.styling };
    
    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(title)}</title>
    <style>
        body {
            font-family: ${styling.fontFamily};
            font-size: ${styling.fontSize}pt;
            line-height: ${styling.lineHeight};
            margin: ${styling.margins.top}px ${styling.margins.right}px ${styling.margins.bottom}px ${styling.margins.left}px;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #1976d2;
            padding-bottom: 10px;
        }
        .metadata {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .watermark {
            text-align: center;
            font-style: italic;
            color: #666;
            margin-top: 40px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        p {
            margin-bottom: 1em;
            text-align: justify;
        }
    </style>
</head>
<body>
    <h1>${this.escapeHtml(title)}</h1>`;

    // Metadata
    if (options.includeMetadata && metadata) {
      htmlContent += `
    <div class="metadata">
        <h3>Document Information</h3>
        <ul>
            <li><strong>Exported:</strong> ${new Date().toLocaleString()}</li>`;
      
      if (metadata.humanizationScore) {
        htmlContent += `<li><strong>Humanization Score:</strong> ${metadata.humanizationScore}%</li>`;
      }
      if (metadata.originalLength) {
        htmlContent += `<li><strong>Original Length:</strong> ${metadata.originalLength} characters</li>`;
      }
      if (metadata.processedLength) {
        htmlContent += `<li><strong>Processed Length:</strong> ${metadata.processedLength} characters</li>`;
      }
      
      htmlContent += `
        </ul>
    </div>`;
    }

    // Content
    const paragraphs = content.split('\n\n');
    paragraphs.forEach(paragraph => {
      if (paragraph.trim()) {
        htmlContent += `    <p>${this.escapeHtml(paragraph.trim()).replace(/\n/g, '<br>')}</p>\n`;
      }
    });

    // Watermark
    if (options.watermark) {
      htmlContent += `    <div class="watermark">${this.escapeHtml(options.watermark)}</div>\n`;
    }

    htmlContent += `
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const fileName = `${this.sanitizeFileName(title)}.html`;

    return { blob, fileName };
  }

  private async exportToRTF(
    title: string,
    content: string,
    options: ExportOptions
  ): Promise<{ blob: Blob; fileName: string }> {
    let rtfContent = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}';
    
    // Title
    rtfContent += `\\f0\\fs24\\b ${title}\\b0\\par\\par`;
    
    // Content
    const paragraphs = content.split('\n\n');
    paragraphs.forEach(paragraph => {
      if (paragraph.trim()) {
        rtfContent += `\\f0\\fs${(options.styling?.fontSize || 12) * 2} ${paragraph.trim()}\\par\\par`;
      }
    });

    // Watermark
    if (options.watermark) {
      rtfContent += `\\par\\par\\f0\\fs16\\i ${options.watermark}\\i0`;
    }

    rtfContent += '}';

    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    const fileName = `${this.sanitizeFileName(title)}.rtf`;

    return { blob, fileName };
  }

  private async exportToJSON(
    title: string,
    content: string,
    options: ExportOptions,
    metadata?: any
  ): Promise<{ blob: Blob; fileName: string }> {
    const jsonData = {
      title,
      content,
      metadata: options.includeMetadata ? {
        ...metadata,
        exportedAt: new Date().toISOString(),
        exportFormat: 'json'
      } : undefined,
      exportOptions: options
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const fileName = `${this.sanitizeFileName(title)}.json`;

    return { blob, fileName };
  }

  // Helper method for bulk export
  private async exportSingleDocumentToBlob(
    title: string,
    content: string,
    options: ExportOptions,
    metadata?: any
  ): Promise<{ success: boolean; blob?: Blob; error?: string }> {
    try {
      let result;
      
      switch (options.format) {
        case 'txt':
          result = await this.exportToText(title, content, options);
          break;
        case 'pdf':
          result = await this.exportToPDF(title, content, options, metadata);
          break;
        case 'docx':
          result = await this.exportToDocx(title, content, options, metadata);
          break;
        case 'latex':
          result = await this.exportToLaTeX(title, content, options, metadata);
          break;
        case 'markdown':
          result = await this.exportToMarkdown(title, content, options, metadata);
          break;
        case 'html':
          result = await this.exportToHTML(title, content, options, metadata);
          break;
        case 'rtf':
          result = await this.exportToRTF(title, content, options);
          break;
        case 'json':
          result = await this.exportToJSON(title, content, options, metadata);
          break;
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }

      return { success: true, blob: result.blob };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  // Utility methods
  private generateIndexFile(documents: any[], format: string): string {
    const timestamp = new Date().toLocaleString();
    
    switch (format) {
      case 'markdown':
        let mdIndex = `# Export Index\n\n**Generated:** ${timestamp}\n\n## Documents\n\n`;
        documents.forEach((doc, index) => {
          mdIndex += `${index + 1}. [${doc.title}](./${this.sanitizeFileName(doc.title)}.md)\n`;
        });
        return mdIndex;
        
      case 'html':
        let htmlIndex = `<!DOCTYPE html>
<html><head><title>Export Index</title></head><body>
<h1>Export Index</h1>
<p><strong>Generated:</strong> ${timestamp}</p>
<h2>Documents</h2><ul>`;
        documents.forEach(doc => {
          htmlIndex += `<li><a href="./${this.sanitizeFileName(doc.title)}.html">${this.escapeHtml(doc.title)}</a></li>`;
        });
        htmlIndex += '</ul></body></html>';
        return htmlIndex;
        
      default:
        let txtIndex = `Export Index\n\nGenerated: ${timestamp}\n\nDocuments:\n`;
        documents.forEach((doc, index) => {
          txtIndex += `${index + 1}. ${doc.title}\n`;
        });
        return txtIndex;
    }
  }

  private getFileExtension(format: string): string {
    const extensions: Record<string, string> = {
      txt: 'txt',
      pdf: 'pdf',
      docx: 'docx',
      latex: 'tex',
      markdown: 'md',
      html: 'html',
      rtf: 'rtf',
      json: 'json'
    };
    return extensions[format] || 'txt';
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
  }

  private escapeLatex(text: string): string {
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/[{}]/g, '\\$&')
      .replace(/[#$%&_]/g, '\\$&')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/~/g, '\\textasciitilde{}');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Integration methods
  public async exportToGoogleDocs(title: string, content: string): Promise<boolean> {
    // This would integrate with Google Docs API
    try {
      // Implementation would require Google API setup
      console.log('Google Docs integration not implemented yet');
      return false;
    } catch (error) {
      console.error('Google Docs export failed:', error);
      return false;
    }
  }

  public async exportToMicrosoftWord(title: string, content: string): Promise<boolean> {
    // This would integrate with Microsoft Graph API
    try {
      // Implementation would require Microsoft Graph API setup
      console.log('Microsoft Word integration not implemented yet');
      return false;
    } catch (error) {
      console.error('Microsoft Word export failed:', error);
      return false;
    }
  }

  public getAvailableFormats(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'txt', label: 'Plain Text', description: 'Simple text file (.txt)' },
      { value: 'pdf', label: 'PDF', description: 'Portable Document Format (.pdf)' },
      { value: 'docx', label: 'Word Document', description: 'Microsoft Word (.docx)' },
      { value: 'latex', label: 'LaTeX', description: 'LaTeX document (.tex)' },
      { value: 'markdown', label: 'Markdown', description: 'Markdown file (.md)' },
      { value: 'html', label: 'HTML', description: 'Web page (.html)' },
      { value: 'rtf', label: 'Rich Text', description: 'Rich Text Format (.rtf)' },
      { value: 'json', label: 'JSON', description: 'JSON data file (.json)' }
    ];
  }
}

export const advancedExportService = new AdvancedExportService();
export default advancedExportService;