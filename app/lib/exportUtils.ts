import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { saveAs } from 'file-saver';

export interface ExportData {
  patientName: string;
  specialty: string;
  content: string;
  date: string;
}

// PDF Export
export async function exportToPDF(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  // Create a clean clone to avoid lab() color issues
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Add inline styles to override Tailwind's lab() colors
  const styleOverride = document.createElement('style');
  styleOverride.textContent = `
    * {
      color: rgb(55, 65, 81) !important;
    }
    h1, h2, h3, h4, h5, h6 {
      color: rgb(17, 24, 39) !important;
    }
    strong {
      color: rgb(17, 24, 39) !important;
    }
  `;
  clone.insertBefore(styleOverride, clone.firstChild);

  // Temporarily add clone to DOM (hidden)
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.background = 'white';
  document.body.appendChild(clone);

  try {
    // Capture the clone as canvas
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297; // A4 height in mm

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    pdf.save(fileName);
  } finally {
    // Clean up: remove clone from DOM
    document.body.removeChild(clone);
  }
}

// DOCX Export
export async function exportToDocx(data: ExportData, fileName: string) {
  // Parse the content into sections
  const lines = data.content.split('\n').filter(line => line.trim());
  
  const children: any[] = [];

  // Add header
  children.push(
    new Paragraph({
      text: 'MEDICAL REPORT',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Patient Name: ', bold: true }),
        new TextRun(data.patientName),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Specialty: ', bold: true }),
        new TextRun(data.specialty),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Date: ', bold: true }),
        new TextRun(data.date),
      ],
      spacing: { after: 400 },
    })
  );

  // Parse content sections
  for (const line of lines) {
    if (line.startsWith('##')) {
      // Heading 2
      children.push(
        new Paragraph({
          text: line.replace(/^##\s*/, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        })
      );
    } else if (line.startsWith('#')) {
      // Heading 1
      children.push(
        new Paragraph({
          text: line.replace(/^#\s*/, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
    } else if (line.startsWith('**') && line.endsWith('**')) {
      // Bold text
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.replace(/\*\*/g, ''),
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      // Bullet point
      children.push(
        new Paragraph({
          text: line.replace(/^[-*]\s*/, ''),
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    } else {
      // Regular paragraph
      children.push(
        new Paragraph({
          text: line,
          spacing: { after: 150 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}

// Print functionality
export function printReport(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Failed to open print window');
  }

  const styles = `
    <style>
      @media print {
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #000;
          max-width: 210mm;
          margin: 0 auto;
          padding: 20mm;
        }
        h1 { font-size: 24px; margin-bottom: 10px; }
        h2 { font-size: 20px; margin-top: 20px; margin-bottom: 10px; }
        h3 { font-size: 16px; margin-top: 15px; margin-bottom: 8px; }
        p { margin-bottom: 10px; }
        .no-print { display: none; }
        @page { margin: 20mm; }
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.6;
        color: #000;
        padding: 20px;
      }
      h1 { font-size: 24px; margin-bottom: 10px; }
      h2 { font-size: 20px; margin-top: 20px; margin-bottom: 10px; }
      h3 { font-size: 16px; margin-top: 15px; margin-bottom: 8px; }
    </style>
  `;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Medical Report - Print</title>
        ${styles}
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    // Don't close automatically - let user close it
  };
}

// Helper function to sanitize filename
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}
