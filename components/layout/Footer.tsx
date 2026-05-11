export default function Footer() {
    return(
        <footer className="bg-[#eee9e4] mt-20">
            <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-gray-600 flex flex-col md:flex-row justify-between gap-6">
                <p>LawonBloom</p>

                <div className="flex gap-6 flex-wrap">
                    <a href="#">Privacy Register</a>
                    <a href="#">Terms of Care</a>
                    <a href="#">Global Access</a>
                    <a href="#">Media Sanctuary</a>
                </div>

                <p>&copy; 2026 LawonBloom. All rights reserved.</p>
            </div>
        </footer>
    );
}