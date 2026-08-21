import { NextRequest, NextResponse } from "next/server";
import { CanvasFactory } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import * as mammoth from "mammoth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("resume");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { error: "Resume file is required" },
                { status: 400 }
            );
        }

        const fileName = file.name.toLowerCase();

        if (!fileName.endsWith(".pdf") && !fileName.endsWith(".docx")) {
            return NextResponse.json(
                { error: "Only PDF and DOCX files are supported" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        let text = "";

        // PDF
        if (fileName.endsWith(".pdf")) {
            const parser = new PDFParse({
                data: buffer,
                CanvasFactory,
            });

            try {
                const result = await parser.getText();
                text = result.text;
            } finally {
                await parser.destroy();
            }
        }

        // DOCX
        if (fileName.endsWith(".docx")) {
            const result = await mammoth.extractRawText({
                buffer,
            });

            text = result.value;
        }

        text = text
            .replace(/\r/g, "")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

        if (!text) {
            return NextResponse.json(
                {
                    error:
                        "Could not extract text from this resume. The PDF may be scanned or image-based.",
                },
                { status: 422 }
            );
        }

        console.log("Resume parsed successfully:", {
            fileName: file.name,
            characters: text.length,
        });

        return NextResponse.json({
            success: true,
            fileName: file.name,
            text,
        });
    } catch (error) {
        console.error("Resume parsing error:", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to parse resume",
            },
            { status: 500 }
        );
    }
}