"use client"

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {

    //responsive navbar searchBox
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 700);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    //handling query
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const q = query.trim();
        if (!q) return;

        router.push(`/search/${encodeURIComponent(q)}`);
    }

    return (
        <>
            <div className="fixed top-0 left-0 w-full z-50 backdrop-blur-md">
                <nav className="flex justify-between items-center mx-[15%] my-[1%] max-[700px]:mx-[3%]">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src="/bars-staggered-solid.svg" alt="User" width={20} height={20} className="h-5 w-5" />
                        <span className="text-2xl font-semibold max-[700px]:text-xl">BookShelf</span>
                    </Link>

                    <div className="flex justify-center items-center">

                        <form onSubmit={handleSubmit} className="bg-black py-2 rounded-2xl px-4 outline-none flex items-center max-[700px]:px-2 max-[700px]:py-1.5">
                            <input
                                type="text"
                                value={query}
                                placeholder={isMobile ? "Search" : "Search Books"}
                                onChange={(e) => setQuery(e.target.value)}
                                className="outline-none font-semibold text-white/60 w-50 max-[700px]:w-22"
                            />
                            <button type="submit" className="cursor-pointer">
                                <Image src="/arrow-right-solid.svg" alt="" width={20} height={20} className="h-4 w-4" />
                            </button>
                        </form>

                        <Link href="/user" className="ml-5 max-[700px]:ml-2">
                            <Image src="/user-solid.svg" alt="User" width={20} height={20} className="filter brightness-0 invert h-4 w-4" />
                        </Link>
                    </div>
                </nav>
                <hr className="h-px bg-gray-500 border-0" />
            </div>

            

        </>
    );
}