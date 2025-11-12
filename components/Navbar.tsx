"use client"

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 700);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <nav className="flex justify-between items-center mx-[15%] my-[1%] max-[700px]:mx-[3%]">
            <Link href="/" className="flex items-center gap-3">
                <Image src="/bars-staggered-solid.svg" alt="User" width={20} height={20} className="h-5 w-5" />
                <span className="text-2xl font-semibold max-[700px]:text-xl">BookShelf</span>
            </Link>

            <div className="flex justify-center items-center">
                <div className="bg-black py-2 rounded-2xl px-4 outline-none flex items-center max-[700px]:px-2 max-[700px]:py-1.5">
                    <input
                      type="text"
                      placeholder={isMobile ? "Search" : "Search Books"}
                      className="outline-none font-semibold text-white/60 w-50 max-[700px]:w-22"
                    />
                    <Link href="/user" className="cursor-pointer">
                        <Image src="/arrow-right-solid.svg" alt="" width={20} height={20} className="h-4 w-4"/>
                    </Link>
                </div>

                <Link href="/user" className="ml-5 max-[700px]:ml-2">
                    <Image src="/user-solid.svg" alt="User" width={20} height={20} className="filter brightness-0 invert h-4 w-4" />
                </Link>
            </div>
        </nav>
    );
}