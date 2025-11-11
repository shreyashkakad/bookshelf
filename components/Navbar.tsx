import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="flex justify-between items-center mx-[15%] my-[1%]">
            <Link href="/" className="flex items-center gap-3">
                <Image src="/bars-staggered-solid.svg" alt="User" width={20} height={20} className="h-5 w-5" />
                <span className="text-2xl font-semibold">BookShelf</span>
            </Link>

            <div className="flex justify-center items-center">
                <div className="bg-black py-2 rounded-2xl px-6 outline-none flex items-center">
                    <input type="text" placeholder="Search Books" className="outline-none font-semibold text-white/60" />
                    <button className="cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right h-3 w-3" aria-hidden="true">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <Link href="/user" className="ml-5">
                    <Image src="/user-solid.svg" alt="User" width={20} height={20} className="filter brightness-0 invert h-4 w-4" />
                </Link>
            </div>
        </nav>
    );
}