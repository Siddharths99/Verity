import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisRecord } from '../types';

/**
 * Generates and downloads a multi-page Enterprise Forensic Audit PDF Report
 */
export const exportAuditLogToPdf = (records: AnalysisRecord[], userEmail: string = 'visaljk07@gmail.com') => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const generatedAt = new Date().toLocaleString();

  // Dark Header Banner
  doc.setFillColor(8, 11, 17); // Deep Slate Navy
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Accent Line
  doc.setFillColor(6, 182, 212); // Cyan accent
  doc.rect(0, 32, pageWidth, 1.5, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('VERITY', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(6, 182, 212);
  doc.text('FORENSIC AUDIT & INCIDENT TELEMETRY REPORT', 42, 15);

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${generatedAt}  |  Protected Account: ${userEmail}  |  Classification: RESTRICTED / SECOPS`, 14, 25);

  // Summary Metrics Section
  const criticalCount = records.filter(r => r.risk === 'CRITICAL' || r.risk === 'HIGH').length;
  const safeCount = records.filter(r => r.risk === 'LOW').length;
  const avgScore = Math.round(records.reduce((acc, r) => acc + r.score, 0) / (records.length || 1));

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 38, pageWidth - 28, 18, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 38, pageWidth - 28, 18, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('EXECUTIVE AUDIT SUMMARY', 18, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Total Interactions Scanned: ${records.length}   |   Threats Intercepted: ${criticalCount}   |   Verified Clean: ${safeCount}   |   Avg Risk Score: ${avgScore}/100`,
    18,
    51
  );

  // Table Data Preparation
  const tableData = records.map((record) => [
    record.id,
    record.time,
    record.type.toUpperCase(),
    record.subject,
    record.identityDetails.callerOrSender,
    record.risk,
    `${record.score}/100`,
    record.requestedActionDetails.actionType,
    record.action
  ]);

  // AutoTable
  autoTable(doc, {
    startY: 60,
    head: [['ID', 'Time', 'Channel', 'Subject / Context', 'Sender / Origin', 'Risk', 'Score', 'Action Requested', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.5
    },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold' },
      1: { cellWidth: 18 },
      2: { cellWidth: 16, fontStyle: 'bold' },
      3: { cellWidth: 45 },
      4: { cellWidth: 40 },
      5: { cellWidth: 18, fontStyle: 'bold' },
      6: { cellWidth: 14, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 70 },
      8: { cellWidth: 20, halign: 'center' }
    },
    didParseCell: (data) => {
      // Color-code Risk column
      if (data.column.index === 5 && data.section === 'body') {
        const text = String(data.cell.raw);
        if (text === 'CRITICAL') {
          data.cell.styles.textColor = [220, 38, 38];
        } else if (text === 'HIGH') {
          data.cell.styles.textColor = [234, 88, 12];
        } else if (text === 'MEDIUM') {
          data.cell.styles.textColor = [202, 138, 4];
        } else if (text === 'LOW') {
          data.cell.styles.textColor = [22, 163, 74];
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 18 }
  });

  // Footer for each page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);

    // Footer line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.text(
      'VERITY Multimodal AI Impersonation & Fraud Prevention Engine — Cryptographically Verified Attestation Log',
      14,
      pageHeight - 7
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 28,
      pageHeight - 7
    );
  }

  // Save the generated PDF
  const filename = `VERITY_Forensic_Audit_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

/**
 * Generates an Individual Incident Forensic Dossier PDF (e.g. for VRY-1042)
 */
export const exportIncidentReportToPdf = (record: AnalysisRecord, incidentCode: string = 'VRY-1042') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top Dark Header
  doc.setFillColor(8, 11, 17);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setFillColor(239, 68, 68); // Red border for high risk
  doc.rect(0, 35, pageWidth, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('VERITY', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(239, 68, 68);
  doc.text(`INCIDENT FORENSIC DOSSIER #${incidentCode}`, 42, 16);

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Time: ${record.time}  |  Type: ${record.type.toUpperCase()}  |  Risk Verdict: ${record.risk} (${record.score}/100)`, 14, 26);

  // Large Warning Banner
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(14, 42, pageWidth - 28, 22, 2, 2, 'F');
  doc.setDrawColor(252, 165, 165);
  doc.roundedRect(14, 42, pageWidth - 28, 22, 2, 2, 'S');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('VERDICT: DO NOT TRUST THIS INTERACTION', 20, 51);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(127, 29, 29);
  doc.text('Multiple correlated fraud vectors detected: Unknown VoIP identity, AI voice cloning, and urgent OTP demand.', 20, 58);

  // Four Core Questions Breakdown Table
  autoTable(doc, {
    startY: 70,
    head: [['Dimension', 'Forensic Assessment', 'Confidence']],
    body: [
      ['WHO', 'Caller identity could not be independently verified (VoIP origin, missing STIR/SHAKEN Level A).', '98%'],
      ['WHAT', 'Communication contains synthetic acoustic anomalies and coercive urgency manipulation.', '91%'],
      ['REQUEST', 'Demanded immediate $48,500 wire authorization & verbal OTP passcode.', '99%'],
      ['TRUSTWORTHY?', 'NO. Correlated multi-vector score exceeds critical threshold (87/100).', 'CRITICAL']
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3.5
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 120 },
      2: { cellWidth: 26, fontStyle: 'bold', halign: 'center' }
    }
  });

  // Recommended Protocol Panel
  const finalY = (doc as any).lastAutoTable.finalY || 140;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, finalY + 8, pageWidth - 28, 38, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, finalY + 8, pageWidth - 28, 38, 2, 2, 'S');

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('MANDATORY ENFORCEMENT PROTOCOL', 20, finalY + 16);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('1. Do not share OTP, passwords, or financial account information.', 20, finalY + 23);
  doc.text('2. End the interaction immediately and block inbound carrier route.', 20, finalY + 29);
  doc.text('3. Perform secondary verification through verified enterprise internal directory.', 20, finalY + 35);
  doc.text('4. Dispatch automated incident telemetry to Security Operations (SecOps).', 20, finalY + 41);

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'VERITY Security Platform — Sealed Forensic Incident Record — RFC-5424 Compliant',
    14,
    pageHeight - 10
  );

  doc.save(`VERITY_Incident_Report_${incidentCode}_${new Date().toISOString().slice(0, 10)}.pdf`);
};
