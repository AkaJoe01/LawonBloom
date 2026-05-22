import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { doctor, date, time, firstName, lastName, email, phone, notes } = await request.json();

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ success: false, error: "SMTP credentials not configured" }, { status: 500 });
    }

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 15000,
    });

    await transporter.verify();

    const recipient = process.env.SMTP_RECIPIENT || process.env.SMTP_USER;

    const clinicMail = {
      from: process.env.SMTP_FROM,
      to: recipient,
      subject: `New Booking - ${firstName} ${lastName}`,
      html: `
        <h2>New Consultation Booking</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <hr />
        <p><strong>Specialist:</strong> ${doctor}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <hr />
        <p><strong>Notes:</strong> ${notes || "None"}</p>
      `,
    };

    const userMail = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: `We've Received Your Inquiry — Lawonbloom`,
      html: `
        <h2>Thank You, ${firstName}.</h2>
        <p>We have received your consultation request and a member of our concierge team will review it shortly.</p>
        <hr />
        <p><strong>Specialist:</strong> ${doctor}</p>
        <p><strong>Preferred Date:</strong> ${date}</p>
        <p><strong>Preferred Time:</strong> ${time}</p>
        <hr />
        <p>You will hear back from us within 24 hours to confirm your appointment.</p>
        <br />
        <p>With care,</p>
        <p>— Lawonbloom Fertility Centre</p>
      `,
    };

    const results = await Promise.allSettled([transporter.sendMail(clinicMail), transporter.sendMail(userMail)]);

    const clinicOk = results[0].status === "fulfilled";
    const userOk = results[1].status === "fulfilled";

    if (!clinicOk) {
      console.error("Clinic email failed:", results[0].status === "rejected" ? results[0].reason : "unknown");
    }
    if (!userOk) {
      console.error("User email failed:", results[1].status === "rejected" ? results[1].reason : "unknown");
    }

    if (!clinicOk && !userOk) {
      const clinicReason = results[0].status === "rejected" ? String(results[0].reason) : "unknown";
      const userReason = results[1].status === "rejected" ? String(results[1].reason) : "unknown";
      return NextResponse.json({ success: false, error: `Clinic: ${clinicReason} | User: ${userReason}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, clinicNotified: clinicOk, userNotified: userOk });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Email send error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
