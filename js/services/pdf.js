// ============================================================
// QAF – PDF Export Service (jsPDF + html2canvas)
// ============================================================

const PdfService = {
  async exportElement(elementId, filename = 'qaf-export.pdf') {
    const el = document.getElementById(elementId);
    if (!el) return;
    QAF.toast.info('Exporting', 'Generating PDF...');
    try {
      const canvas = await html2canvas(el, {
        scale: 2, useCORS: true, logging: false,
        backgroundColor: '#faf6eb'
      });
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 20;
      const imgH = (canvas.height * imgW) / canvas.width;
      let y = 10;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (imgH <= pageH - 20) {
        pdf.addImage(imgData, 'JPEG', 10, y, imgW, imgH);
      } else {
        let remainH = imgH;
        let srcY = 0;
        while (remainH > 0) {
          const sliceH = Math.min(pageH - 20, remainH);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = (sliceH / imgH) * canvas.height;
          const ctx = sliceCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, srcY, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);
          const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
          if (srcY > 0) pdf.addPage();
          pdf.addImage(sliceData, 'JPEG', 10, 10, imgW, sliceH);
          srcY += sliceCanvas.height;
          remainH -= sliceH;
        }
      }
      pdf.save(filename);
      QAF.toast.success('Success', 'PDF downloaded!');
    } catch (e) {
      console.error(e);
      QAF.toast.error('Error', 'Failed to generate PDF');
    }
  },

  async exportTable(headers, rows, title, filename = 'qaf-data.pdf') {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('l', 'mm', 'a4');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(26, 58, 42);
    pdf.text(title, 14, 20);
    pdf.setFontSize(8);
    pdf.setTextColor(100);
    pdf.text('Generated: ' + new Date().toLocaleString(), 14, 27);

    const startY = 35;
    const cellPad = 4;
    const colW = (pdf.internal.pageSize.getWidth() - 28) / headers.length;
    let y = startY;

    // Header
    pdf.setFillColor(26, 58, 42);
    pdf.rect(14, y, pdf.internal.pageSize.getWidth() - 28, 10, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(228, 204, 122);
    headers.forEach((h, i) => pdf.text(h, 14 + i * colW + cellPad, y + 7));

    y += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(74, 55, 40);
    pdf.setFontSize(8);

    rows.forEach((row, idx) => {
      if (y > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        y = 20;
      }
      if (idx % 2 === 0) {
        pdf.setFillColor(245, 240, 225);
        pdf.rect(14, y, pdf.internal.pageSize.getWidth() - 28, 8, 'F');
      }
      row.forEach((cell, i) => {
        pdf.text(String(cell || '').substring(0, 30), 14 + i * colW + cellPad, y + 5.5);
      });
      y += 8;
    });

    pdf.save(filename);
    QAF.toast.success('Success', 'PDF downloaded!');
  },

  exportCSV(headers, rows, filename = 'qaf-data.csv') {
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    QAF.toast.success('Success', 'CSV downloaded!');
  }
};

window.PdfService = PdfService;
