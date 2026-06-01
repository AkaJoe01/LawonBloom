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
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      systemInstruction: "You are a direct, straightforward assistant for Lawonbloom Fertility Centre. Answer ONLY what is asked \u2014 no extra fluff, no paragraphs. Give short, factual answers in 1-3 sentences unless more detail is specifically requested. If the question is NOT about Lawonbloom\u2019s medical services, fertility treatments, or the clinic itself, respond ONLY with: I can\u2019t answer this. Never invent or guess information not provided in your knowledge.",
    });

    const prompt = `COMPANY INFO:
- Name: Lawonbloom Fertility Centre (Lawonbloom). Tagline: "Where Hope Blossoms into Life."
- Founded: 1998 in Lagos, Nigeria. Now located at NO. 6, Canon Odusanwo Street, Off Deji Oyelese Street, Old Bodija Avenue, Ibadan, Nigeria.
- Phone: +2349132504126. Email: lawonbloomf@gmail.com
- Founder & Lead Doctor: Dr. Olugbenga Oluseun Saanu \u2014 Chief Medical Director, Lead Fertility Specialist, Chief Clinical Architect. Decades of global experience, Royal College of Obstetricians & Gynecologists recognition.
- Other team: Nurse Elena Rostova (Fertility Nurse), Serah Jenkins (Director of Patient Wellness), Dr. Marcus Thorne (Reproductive Geneticist).

SERVICES:
- IVF (In Vitro Fertilization): 4 phases \u2014 Ovarian Stimulation, Egg Retrieval (gentle sedation, ultrasound-guided), Fertilization & Culture (class-100 cleanroom, ICSI or conventional), Embryo Transfer. Full cycle: 4-6 weeks.
- ICSI (Intracytoplasmic Sperm Injection): Used within IVF to inject a single sperm directly into an egg.
- IUI (Intrauterine Insemination): Minimally invasive. 3 phases \u2014 Monitoring & Stimulation, Sample Preparation, Procedure. For unexplained infertility, ovulation issues, or donor sperm.
- Genetic Screening: PGT-A (aneuploidy screening), PGT-M (monogenic disorders), PGT-SR (structural rearrangements). Comprehensive counseling included.
- Oocyte Preservation (Egg Freezing): Rapid vitrification flash-freezing, biometric security, 24/7 monitoring. For career, medical necessity, or personal readiness.
- Fertility Preservation: Egg and sperm freezing. Same technology as oocyte preservation.
- Surrogacy: Full concierge \u2014 surrogate matching, legal navigation, medical coordination, emotional support.
- Holistic Support: Wellness counseling, mindfulness/meditation, nutritional therapy, acupuncture, gentle yoga.
- Other services: Sonohysterogram (saline ultrasound imaging), Hysteroscopy (diagnostic/operative).

SANCTUARY & FACILITIES:
- ISO Class 5 air purity (HEPA/VOC filtration), thermal stability, biometric security, RFID tracking.
- Class-100/Class-10,000 cleanroom embryology lab.
- AI-assisted embryo selection, time-lapse incubation, next-gen genetics.
- Accreditation: International lab certifications, GDPR & HIPAA compliant.
- Philosophy: "Scientific Serenity" \u2014 combining medical precision with a calming environment.

CLIENTELE: Serves local and international patients (London, Dubai, New York, global African diaspora). Concierge team handles travel, visas, accommodation, airport transfers.

CONSULTATION: Book via /journey/consultation. Initial consultation is a listening session with a Senior Fertility Specialist and Wellness Concierge.

PRIVACY: Private entry, unmarked suites, encrypted communications, biometric-secured records, staff bound by NDAs.

OPENING HOURS: Monday to Friday 8am - 4pm. Saturday and Sunday 9am - 12pm. Public holidays are strictly by appointment only.

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
