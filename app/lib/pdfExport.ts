import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDF(reportContent: string, patientName: string): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Page settings
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Medical Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Generated: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Content
  doc.setFontSize(11);
  const lines = reportContent.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we need a new page
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    // Handle headers (lines starting with ##)
    if (line.startsWith('## ')) {
      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      const headerText = line.replace('## ', '');
      doc.text(headerText, margin, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
    }
    // Handle bold text (**text**)
    else if (line.includes('**')) {
      const cleanLine = line.replace(/\*\*/g, '');
      doc.setFont('helvetica', 'bold');
      const splitText = doc.splitTextToSize(cleanLine, maxWidth);
      doc.text(splitText, margin, yPosition);
      yPosition += splitText.length * 6;
      doc.setFont('helvetica', 'normal');
    }
    // Regular text
    else if (line.trim()) {
      const splitText = doc.splitTextToSize(line, maxWidth);
      doc.text(splitText, margin, yPosition);
      yPosition += splitText.length * 6;
    }
    // Empty line
    else {
      yPosition += 4;
    }
  }

  // Save PDF
  const fileName = `medical-report-${patientName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  doc.save(fileName);
}

export async function generatePDFFromHTML(elementId: string, fileName: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
}
