import Link from "next/link";
import Image from "next/image";

export default function FeaturedResearch() {
return (
<div className="relative">

{/* IMAGE */}
<Image
src="/images/journal-scan_1.jpg"
alt=""
className="rounded-4xl w-full object-cover"
fill
/>

{/* OVERLAY CARD */}
<div className="absolute bottom-8 left-8 right-8 bg-white/60 backdrop-blur-xl border border-white/40 rounded-[28px] p-8 shadow-lg">

<p className="uppercase tracking-[0.25em] text-xs text-[#9c5c67] mb-4">
Featured Research
</p>

<h2 className="font-serif text-4xl leading-tight mb-6">

The Future of Oocyte
<br />
Cryopreservation

</h2>

<Link
href="#"
className="text-[#9c5c67] uppercase tracking-[0.15em] text-sm"
>
Read Full Report →
</Link>

</div>

</div>
);
}