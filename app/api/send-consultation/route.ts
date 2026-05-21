import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { doctor, date, time, firstName, lastName, email, phone, notes } = await request.json();

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ success: false, error: "SMTP credentials not configured" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
    });

    const clinicMail = {
      from: process.env.SMTP_FROM,
      to: "lawonbloomfertilitycentre@gmail.com",
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
      subject: `Your Consultation Booking Confirmation - Lawonbloom`,
      html: `
        <h2>Your Consultation Booking</h2>
        <p>Dear ${firstName} ${lastName},</p>
        <p>Your consultation has been booked with the following details:</p>
        <hr />
        <p><strong>Specialist:</strong> ${doctor}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <hr />
        <p><strong>Notes:</strong> ${notes || "None"}</p>
        <br />
        <p>A member of our concierge team will reach out within 24 hours.</p>
        <p>— Lawonbloom Fertility Centre</p>
      `,
    };

    await Promise.all([transporter.sendMail(clinicMail), transporter.sendMail(userMail)]);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Email send error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
