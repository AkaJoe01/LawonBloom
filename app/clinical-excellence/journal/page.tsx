import Hero from "@/components/journal/Hero";
import FeaturedResearch from "@/components/journal/FeaturedResearch";
import SearchBar from "@/components/journal/SearchBar";

export default function JournalPage(){
    return(
        <main className="bg-[f5f2ee] text-[#2b2b2b] overflow-hidden">
            <section className="max-w-6xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/** LEFT SIDE */}
                    <div>
                         <Hero />
                         <SearchBar />
                    </div>
                   
                   {/** RIGHT SIDE */}
                    <FeaturedResearch />
                </div>
            </section>
        </main>
    );
}