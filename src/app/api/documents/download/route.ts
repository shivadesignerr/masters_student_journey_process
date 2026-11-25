import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data/store";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const docId = searchParams.get("id");
  const appId = searchParams.get("appId");
  const studentId = searchParams.get("studentId") || "usr-student-01";

  const allDocs = dataStore.getStudentDocuments(studentId);
  const studentApps = dataStore.getStudentApplications(studentId);

  // Check if downloading an offer letter directly by appId or doc-offer-*
  let targetApp = appId ? studentApps.find((a) => a.id === appId) : undefined;
  if (!targetApp && docId?.startsWith("doc-offer-")) {
    const extractedAppId = docId.replace("doc-offer-", "");
    targetApp = studentApps.find((a) => a.id === extractedAppId);
  }

  const doc = allDocs.find((d) => d.id === docId);

  // Try to serve the real uploaded file if it exists on disk
  if (doc?.fileName) {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    // The fileName might be the saved server filename (userId_timestamp_original) or just original
    const candidatePaths = [
      path.join(uploadDir, doc.fileName),
    ];
    for (const fPath of candidatePaths) {
      try {
        const fileBytes = await readFile(fPath);
        const contentType = doc.fileName.endsWith(".pdf")
          ? "application/pdf"
          : doc.fileName.match(/\.(jpg|jpeg)$/)
          ? "image/jpeg"
          : doc.fileName.endsWith(".png")
          ? "image/png"
          : doc.fileName.match(/\.docx?$/)
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/octet-stream";

        const headers = new Headers();
        headers.set("Content-Type", contentType);
        headers.set("Content-Disposition", `attachment; filename="${doc.fileName}"`);
        headers.set("Cache-Control", "no-cache");
        return new NextResponse(fileBytes, { status: 200, headers });
      } catch {
        // File not found on disk — fall through to generated PDF
      }
    }
  }

  const student = dataStore.getStudentProfile(studentId);
  const studentName = student ? `${student.firstName} ${student.lastName}` : "Rahul Sharma";
  const studentIdCode = student?.studentIdCode || "GVK-STU-2026-0042";

  let fileName = doc?.fileName || (targetApp ? targetApp.offerLetterFileName || `${targetApp.universityName.replace(/\s+/g, "_")}_Offer_Letter.pdf` : "GVK_Document.pdf");
  const title = doc?.title || (targetApp ? `${targetApp.universityName} — Conditional Admission Offer Letter` : "GVK Masters Document");

  // Escape parentheses for PDF text streams
  const safePdfText = (str: string) => (str || "").replace(/[()\\]/g, " ");

  let pdfStreamContent = "";

  if (targetApp) {
    const uni = safePdfText(targetApp.universityName);
    const course = safePdfText(targetApp.courseName);
    const intake = safePdfText(targetApp.intake);
    const ref = safePdfText(targetApp.appRefNumber || "PENDING");
    const fee = `${targetApp.tuitionFeeCurrency} ${targetApp.tuitionFee?.toLocaleString()}`;
    const deposit = targetApp.depositAmount ? `${targetApp.tuitionFeeCurrency} ${targetApp.depositAmount.toLocaleString()}` : "N/A";
    const deadline = safePdfText(targetApp.depositDeadline || "Within 30 Days of Issuance");
    const conditions = safePdfText(targetApp.offerConditions || "Standard Academic & English Proficiency Verification");

    pdfStreamContent = `BT
/F1 18 Tf
50 720 Td
(${uni.toUpperCase()}) Tj
/F1 13 Tf
0 -26 Td
(INTERNATIONAL ADMISSIONS & RECRUITMENT OFFICE) Tj
/F1 11 Tf
0 -22 Td
(OFFICIAL CONDITIONAL ADMISSION OFFER LETTER - ACADEMIC INTAKE ${intake.toUpperCase()}) Tj
/F1 10 Tf
0 -30 Td
(Dear ${safePdfText(studentName)},) Tj
0 -18 Td
(We are delighted to confirm your conditional admission offer to ${uni}.) Tj
0 -24 Td
(------------------------------------------------------------------------------------------------------) Tj
0 -20 Td
(APPLICATION & PROGRAM SPECIFICATIONS:) Tj
0 -16 Td
(  - Candidate Name: ${safePdfText(studentName)} [ID: ${safePdfText(studentIdCode)}]) Tj
0 -16 Td
(  - Program Offered: ${course}) Tj
0 -16 Td
(  - Academic Session: ${intake}) Tj
0 -16 Td
(  - Application Reference: ${ref}) Tj
0 -16 Td
(  - Published Annual Tuition: ${fee}) Tj
0 -16 Td
(  - Seat Reservation Initial Deposit: ${deposit}) Tj
0 -16 Td
(  - Deposit Acceptance Deadline: ${deadline}) Tj
0 -24 Td
(------------------------------------------------------------------------------------------------------) Tj
0 -20 Td
(ADMISSION CONDITIONS CHECKLIST REQUIRED BEFORE UNCONDITIONAL/CAS ISSUANCE:) Tj
0 -16 Td
(  * ${conditions}) Tj
0 -16 Td
(  * Submit verified final university marksheets and English test TRF.) Tj
0 -16 Td
(  * Remit required initial tuition deposit before deadline to reserve candidate seat.) Tj
0 -24 Td
(------------------------------------------------------------------------------------------------------) Tj
0 -20 Td
(OFFICIAL DIRECT ADMISSIONS NOTICE:) Tj
0 -16 Td
(This letter was transmitted to your assigned counselor via the authorized agency portal.) Tj
0 -16 Td
(Under UKVI regulations, candidate must formally commit to ONE firm choice to unlock CAS.) Tj
0 -24 Td
(Issued on: ${new Date().toISOString().split("T")[0]} | Verified by GVK Edutech Overseas Operations) Tj
ET`;
  } else {
    pdfStreamContent = `BT
/F1 18 Tf
50 720 Td
(GVK EDUTECH OVERSEAS MASTERS PLATFORM) Tj
/F1 13 Tf
0 -30 Td
(DOCUMENT VERIFICATION DESK) Tj
/F1 11 Tf
0 -25 Td
(Student: ${safePdfText(studentName)} [ID: ${safePdfText(studentIdCode)}]) Tj
0 -20 Td
(Document Title: ${safePdfText(title)}) Tj
0 -20 Td
(File Name: ${safePdfText(fileName)}) Tj
0 -20 Td
(Status: VERIFIED & AUTHENTICATED) Tj
0 -20 Td
(Timestamp: ${new Date().toISOString()}) Tj
ET`;
  }

  const streamBytes = Buffer.from(pdfStreamContent, "utf-8").length;

  const samplePdfContent = `%PDF-1.4
1 0 obj << /Title (${safePdfText(title)}) /Author (GVK Edutech Admissions) /Creator (GVK Masters Platform) >> endobj
2 0 obj << /Type /Catalog /Pages 3 0 R >> endobj
3 0 obj << /Type /Pages /Kids [4 0 R] /Count 1 >> endobj
4 0 obj << /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >> endobj
5 0 obj << /Length ${streamBytes} >> stream
${pdfStreamContent}
endstream
endobj
6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000098 00000 n
00000000147 00000 n
00000000204 00000 n
00000000329 00000 n
00000000661 00000 n
trailer << /Size 7 /Root 2 0 R /Info 1 0 R >>
startxref
738
%%EOF`;

  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `attachment; filename="${fileName}"`);
  headers.set("Cache-Control", "no-cache");

  return new NextResponse(samplePdfContent, {
    status: 200,
    headers,
  });
}
