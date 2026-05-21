import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ success: false, error: "Question is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "AI not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a helpful fertility clinic assistant for Lawonbloom Fertility Centre, a sanctuary for reproductive health. Answer the following question in a warm, professional, and concise manner (2-3 paragraphs max). If the question is not related to fertility, reproductive health, or the clinic's services, politely redirect the conversation back to relevant topics.

Question: ${question}`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return NextResponse.json({ success: true, answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("AI error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
