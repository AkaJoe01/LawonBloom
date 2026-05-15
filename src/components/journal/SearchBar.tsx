import { Search } from "lucide-react";


        export default function SearchBar() {
        return (
        <div className="relative max-w-md">

        <input
        type="text"
        placeholder="Search the journal..."
        className="w-full border border-[#e7ddd7] bg-transparent rounded-xl px-6 py-5 pr-14 outline-none text-sm placeholder:text-gray-400"
        />

        <Search
        className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9c5c67]"
        size={18}
        />

        </div>
        );
        }