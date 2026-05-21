"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const doctors = [
  {
    name: "Dr. Olugbenga Oluseun Saanu",
    role: "Chief Fertility Specialist",
    image: "/images/maleDr.jpg",
  },
];

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
];

const steps = [
  { label: "Specialist", number: 1 },
  { label: "Date & Time", number: 2 },
  { label: "Your Details", number: 3 },
];

const today = new Date();

function getAvailableDates(): Date[] {
  const dates: Date[] = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    if (d.getDay() !== 0) {
      dates.push(d);
    }
  }
  return dates;
}

const availableDates = getAvailableDates();

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function BookingFlow() {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const canProceed = () => {
    if (step === 1) return selectedDoctor !== null;
    if (step === 2) return selectedDate !== null && selectedTime !== null;
    if (step === 3) return formData.firstName && formData.lastName && formData.email;
    return false;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (step < 3) setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setSending(true);
    try {
      await fetch("/api/send-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor: doctors[selectedDoctor!].name,
          date: selectedDate && formatDate(selectedDate),
          time: selectedTime,
          ...formData,
        }),
      });
      setSubmitted(true);
    } catch {
      alert("Failed to send booking. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <section className="mx-auto max-w-6xl px-6 pb-32">
        <div className="rounded-3xl border border-outline-variant/40 bg-surface-bright p-10 text-center md:p-20">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-4xl text-primary md:text-5xl">Your Consultation is Booked</h2>
          <p className="mx-auto mt-4 max-w-lg text-on-surface-variant leading-7">
            A confirmation has been sent to <strong>{formData.email}</strong>. Your
            concierge will reach out within 24 hours.
          </p>
          <div className="mx-auto mt-8 inline-block rounded-2xl border border-outline-variant/30 bg-surface-container-low px-6 py-4 text-left">
            <p className="text-sm text-on-surface-variant">Specialist</p>
            <p className="font-medium">{doctors[selectedDoctor!].name}</p>
            <p className="mt-3 text-sm text-on-surface-variant">Appointment</p>
            <p className="font-medium">
              {selectedDate && formatDate(selectedDate)} at {selectedTime}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pb-32">
      <div className="rounded-3xl border border-outline-variant/40 bg-surface-bright p-6 md:p-12">
        {/* Step Indicator */}
        <div className="mb-10 flex items-center justify-between md:mb-14">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-center">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-colors md:h-8 md:w-8 md:text-xs",
                    step === s.number
                      ? "bg-primary text-on-primary"
                      : step > s.number
                        ? "bg-primary/20 text-primary"
                        : "bg-surface-container-high text-on-surface-variant",
                  )}
                >
                  {step > s.number ? <Check className="h-3.5 w-3.5" /> : s.number}
                </div>
                <span
                  className={cn(
                    "hidden text-sm font-medium md:inline",
                    step >= s.number ? "text-foreground" : "text-on-surface-variant",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-3 h-px w-12 transition-colors md:mx-6 md:w-20",
                    step > s.number ? "bg-primary" : "bg-outline-variant",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Specialist */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-3xl text-foreground md:text-4xl">Choose Your Specialist</h2>
            <p className="mt-2 text-on-surface-variant leading-7">Select the fertility specialist you would like to consult with.</p>
            <div className="mt-8 grid gap-6 md:grid-cols-1 max-w-md mx-auto">
              {doctors.map((doctor, i) => (
                <button
                  key={doctor.name}
                  onClick={() => setSelectedDoctor(i)}
                  className={cn(
                    "rounded-2xl border p-6 text-left transition-all",
                    selectedDoctor === i
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-outline-variant/40 bg-surface-container-low hover:border-primary/40",
                  )}
                >
                  <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-xl">
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-display text-xl text-foreground">{doctor.name}</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">{doctor.role}</p>
                  <div
                    className={cn(
                      "mt-5 flex w-full items-center justify-center rounded-full py-2.5 text-sm font-medium transition-all",
                      selectedDoctor === i
                        ? "bg-primary text-on-primary"
                        : "border border-primary/30 text-primary hover:bg-primary hover:text-on-primary",
                    )}
                  >
                    {selectedDoctor === i ? "Selected" : "Select"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div>
            <h2 className="font-display text-3xl text-foreground md:text-4xl">Select Date & Time</h2>
            <p className="mt-2 text-on-surface-variant leading-7">Choose a preferred date and time for your consultation.</p>

            <div className="mt-8">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                <Calendar className="h-4 w-4" />
                Available Dates
              </div>
              <div className="flex flex-wrap gap-2">
                {availableDates.map((date) => {
                  const active = selectedDate?.toDateString() === date.toDateString();
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                      className={cn(
                        "rounded-lg border px-4 py-2.5 text-sm transition-all",
                        active
                          ? "border-primary bg-primary text-on-primary"
                          : "border-outline-variant/40 bg-surface-container-low hover:border-primary/40",
                      )}
                    >
                      {formatDate(date)}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="mt-8">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                  <Clock className="h-4 w-4" />
                  Available Times
                </div>
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "rounded-lg border px-4 py-2.5 text-sm transition-all",
                        selectedTime === time
                          ? "border-primary bg-primary text-on-primary"
                          : "border-outline-variant/40 bg-surface-container-low hover:border-primary/40",
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Your Details */}
        {step === 3 && (
          <div>
            <h2 className="font-display text-3xl text-foreground md:text-4xl">Your Details</h2>
            <p className="mt-2 text-on-surface-variant leading-7">We will send your confirmation to this address.</p>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-on-surface-variant">First Name</label>
                <input
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Your first name"
                  className="mt-1.5 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant">Last Name</label>
                <input
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Your last name"
                  className="mt-1.5 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+234 800 000 0000"
                  className="mt-1.5 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-on-surface-variant">Notes (optional)</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any specific concerns or questions..."
                  className="mt-1.5 w-full resize-none rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between border-t border-outline-variant/20 pt-6">
          <div>
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)} className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => { setStep(1); setSelectedDoctor(null); setSelectedDate(null); setSelectedTime(null); setFormData({ firstName: "", lastName: "", email: "", phone: "", notes: "" }); setSubmitted(false); }}
              className="text-sm"
            >
              Reset
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="gap-1">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed() || sending}>
                {sending ? "Sending..." : "Confirm Booking"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
