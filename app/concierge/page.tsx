export default function ConciergePage() {
    return (
        <main className="min-h-screen bg-[#FAF9F5] text-[#2b2b2b] px-6 py-12">
            <div className="mx-auto max-w-6xl rounded-3xl bg-white p-10 shadow-lg shadow-black/5">
                <h1 className="text-4xl font-semibold tracking-tight">Concierge</h1>
                <p className="mt-6 text-lg leading-8 text-[#525252]">
                    Welcome to our Concierge services. We are here to support your journey with personalized guidance,
                    seamless coordination, and caring support every step of the way.
                </p>
                <div className="mt-10 grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-[#E6E3DB] bg-[#FCFBF9] p-6">
                        <h2 className="text-2xl font-semibold">Personal Guidance</h2>
                        <p className="mt-3 text-sm leading-6 text-[#6B6B6B]">
                            Our concierge team helps you navigate appointments, treatments, and resources tailored to your needs.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-[#E6E3DB] bg-[#FCFBF9] p-6">
                        <h2 className="text-2xl font-semibold">Dedicated Support</h2>
                        <p className="mt-3 text-sm leading-6 text-[#6B6B6B]">
                            From first contact through every milestone, we provide thoughtful support so you can focus on your care.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
