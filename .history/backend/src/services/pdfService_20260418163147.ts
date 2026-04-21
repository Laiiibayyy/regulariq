import PDFDocument from 'pdfkit';
import { Response } from 'express';
import DocumentModel from '../models/Document';
import Employee from '../models/Employee';
import ComplianceScore from '../models/ComplianceScore';
import User from '../models/User';
import Business from '../models/Buisness';

export const generateAuditPDF = async (userId: string, res: Response) => {
  const user = await User.findById(userId);
  const business = await Business.findOne({ userId });
  const docs = await DocumentModel.find({ userId }).sort({ createdAt: -1 });
  const employees = await Employee.find({ userId, status: 'active' });
  const scoreDoc = await ComplianceScore.findOne({ userId });

  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=regulariq-audit-${Date.now()}.pdf`);
  doc.pipe(res);

  // ── HEADER ──
  doc.rect(0, 0, 612, 120).fill('#0d0d1a');
  doc.fontSize(24).fillColor('#ffffff').font('Helvetica-Bold')
    .text('RegularIQ', 50, 35);
  doc.fontSize(11).fillColor('rgba(255,255,255,0.6)').font('Helvetica')
    .text('Compliance Audit Report', 50, 65);
  doc.fontSize(9).fillColor('rgba(255,255,255,0.4)')
    .text(`Generated: ${new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })}`, 50, 85);

  // Score badge
  const score = scoreDoc?.score || 0;
  const scoreColor = score >= 80 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#f87171';
  doc.rect(470, 30, 90, 60).fill('rgba(99,102,241,0.2)').stroke();
  doc.fontSize(28).fillColor(scoreColor).font('Helvetica-Bold')
    .text(`${score}%`, 470, 40, { width: 90, align: 'center' });
  doc.fontSize(8).fillColor('#ffffff').font('Helvetica')
    .text('COMPLIANCE SCORE', 465, 72, { width: 100, align: 'center' });

  doc.moveDown(5);

  // ── BUSINESS INFO ──
  doc.fontSize(14).fillColor('#1a1a2e').font('Helvetica-Bold')
    .text('Business Information', 50, 140);
  doc.moveTo(50, 158).lineTo(562, 158).stroke('#e5e7eb');

  const infoY = 168;
  const infoData = [
    { label: 'Business Name', value: business?.name || 'N/A' },
    { label: 'Owner', value: user?.name || 'N/A' },
    { label: 'Email', value: user?.email || 'N/A' },
    { label: 'Business Type', value: business?.type || 'N/A' },
    { label: 'Location', value: `${business?.city || ''}, ${business?.state || ''}` },
    { label: 'Employees', value: `${employees.length} staff members` },
  ];

  infoData.forEach((item, i) => {
    const y = infoY + (i * 20);
    doc.fontSize(9).fillColor('#6b7280').font('Helvetica')
      .text(item.label, 50, y);
    doc.fontSize(9).fillColor('#111827').font('Helvetica-Bold')
      .text(item.value, 200, y);
  });

  doc.moveDown(8);

  // ── COMPLIANCE SCORE BREAKDOWN ──
  const breakY = infoY + (infoData.length * 20) + 20;
  doc.fontSize(14).fillColor('#1a1a2e').font('Helvetica-Bold')
    .text('Compliance Score Breakdown', 50, breakY);
  doc.moveTo(50, breakY + 18).lineTo(562, breakY + 18).stroke('#e5e7eb');

  const breakdown = scoreDoc?.breakdown || {};
  const categories = [
    { label: 'Licences', val: breakdown.licenses || 0, color: '#6366f1' },
    { label: 'Permits', val: breakdown.permits || 0, color: '#4ade80' },
    { label: 'Safety Certs', val: breakdown.safety || 0, color: '#fbbf24' },
    { label: 'Insurance', val: breakdown.insurance || 0, color: '#38bdf8' },
    { label: 'Employee Certs', val: breakdown.employee || 0, color: '#f87171' },
  ];

  categories.forEach((cat, i) => {
    const y = breakY + 28 + (i * 28);
    doc.fontSize(9).fillColor('#374151').font('Helvetica')
      .text(cat.label, 50, y + 4);
    doc.fontSize(9).fillColor('#111827').font('Helvetica-Bold')
      .text(`${cat.val}%`, 520, y + 4, { width: 40, align: 'right' });
    // Progress bar background
    doc.rect(180, y, 300, 12).fill('#f3f4f6').stroke();
    // Progress bar fill
    doc.rect(180, y, Math.max(2, (cat.val / 100) * 300), 12).fill(cat.color);
  });

  // ── DOCUMENTS ──
  const docSectionY = breakY + 28 + (categories.length * 28) + 30;
  doc.addPage();

  doc.fontSize(14).fillColor('#1a1a2e').font('Helvetica-Bold')
    .text('Document Vault', 50, 50);
  doc.moveTo(50, 68).lineTo(562, 68).stroke('#e5e7eb');

  if (docs.length === 0) {
    doc.fontSize(10).fillColor('#9ca3af').text('No documents uploaded yet.', 50, 80);
  } else {
    // Table header
    doc.rect(50, 75, 512, 22).fill('#f9fafb');
    doc.fontSize(8).fillColor('#6b7280').font('Helvetica-Bold')
      .text('DOCUMENT NAME', 58, 82)
      .text('CATEGORY', 230, 82)
      .text('EXPIRY DATE', 340, 82)
      .text('STATUS', 460, 82);

    docs.forEach((d, i) => {
      const rowY = 97 + (i * 26);
      if (i % 2 === 0) doc.rect(50, rowY, 512, 26).fill('#fafafa');

      const daysLeft = d.expiryDate
        ? Math.ceil((new Date(d.expiryDate).getTime() - Date.now()) / 86400000)
        : null;
      const status = !daysLeft ? 'No expiry'
        : daysLeft < 0 ? 'Expired'
        : daysLeft <= 30 ? 'Expiring soon'
        : 'Active';
      const statusColor = !daysLeft ? '#6b7280'
        : daysLeft < 0 ? '#ef4444'
        : daysLeft <= 30 ? '#f59e0b'
        : '#10b981';

      doc.fontSize(8).fillColor('#111827').font('Helvetica')
        .text(d.originalName || d.fileName, 58, rowY + 8, { width: 165, ellipsis: true })
        .text(d.category || 'general', 230, rowY + 8)
        .text(d.expiryDate
          ? new Date(d.expiryDate).toLocaleDateString('en-US')
          : 'No expiry', 340, rowY + 8);
      doc.fontSize(8).fillColor(statusColor).font('Helvetica-Bold')
        .text(status, 460, rowY + 8);
    });
  }

  // ── EMPLOYEES ──
  const empStartY = docs.length > 0 ? 97 + (docs.length * 26) + 40 : 120;

  if (empStartY > 650) doc.addPage();

  const empY = empStartY > 650 ? 50 : empStartY;
  doc.fontSize(14).fillColor('#1a1a2e').font('Helvetica-Bold')
    .text('Employee Certifications', 50, empY);
  doc.moveTo(50, empY + 18).lineTo(562, empY + 18).stroke('#e5e7eb');

  if (employees.length === 0) {
    doc.fontSize(10).fillColor('#9ca3af').text('No employees added yet.', 50, empY + 30);
  } else {
    let currentY = empY + 30;
    employees.forEach(emp => {
      if (currentY > 700) { doc.addPage(); currentY = 50; }
      doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold')
        .text(`${emp.name} — ${emp.role || 'Staff'}`, 50, currentY);
      currentY += 18;

      if (emp.certifications.length === 0) {
        doc.fontSize(8).fillColor('#9ca3af').font('Helvetica')
          .text('No certifications on file', 65, currentY);
        currentY += 16;
      } else {
        emp.certifications.forEach((cert: any) => {
          const daysLeft = Math.ceil(
            (new Date(cert.expiryDate).getTime() - Date.now()) / 86400000
          );
          const status = daysLeft < 0 ? '✗ Expired'
            : daysLeft <= 30 ? '⚠ Expiring soon'
            : '✓ Active';
          const color = daysLeft < 0 ? '#ef4444'
            : daysLeft <= 30 ? '#f59e0b'
            : '#10b981';

          doc.fontSize(8).fillColor('#374151').font('Helvetica')
            .text(`• ${cert.name}`, 65, currentY, { continued: true })
            .text(`  Expires: ${new Date(cert.expiryDate).toLocaleDateString('en-US')}`, { continued: true });
          doc.fillColor(color).text(`  ${status}`);
          currentY += 16;
        });
      }
      currentY += 10;
    });
  }

  // ── FOOTER ──
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor('#9ca3af').font('Helvetica')
      .text(
        `RegularIQ Compliance Audit Report · Page ${i + 1} of ${pages.count} · Confidential`,
        50, 780, { align: 'center', width: 512 }
      );
  }

  doc.end();
};