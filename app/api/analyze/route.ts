import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import { getCurrentUser } from "@/lib/auth";
import { analyzeATS } from "@/services/ats";
import { buildResumeDataFromText } from "@/services/resume-parser";

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "PDF must be under 10 MB." }, { status: 400 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    const cleanText = (text ?? "").trim();

    if (cleanText.length < 40) {
      return NextResponse.json(
        { error: "Could not extract readable text from this PDF. It may be a scanned image." },
        { status: 422 }
      );
    }

    const resumeData = buildResumeDataFromText(cleanText);
    const analysis = analyzeATS(resumeData);

    return NextResponse.json({
      text: cleanText.slice(0, 20000),
      resumeData,
      analysis,
    });
  } catch (err) {
    console.error("[analyze] error", err);
    return NextResponse.json({ error: "Failed to analyze this PDF." }, { status: 500 });
  }
}
