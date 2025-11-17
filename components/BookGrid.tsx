"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BookGrid({ books, query, total, offset }: any) {
    const router = useRouter();
    const currentPage = Math.floor(offset / 100) + 1;
    const totalPages = Math.ceil(total / 100);

    const handleNext = () => {
        const newOffset = offset + 100;
        router.push(`/search/${encodeURIComponent(query)}?offset=${newOffset}`);
    };

    const handlePrev = () => {
        const newOffset = Math.max(0, offset - 100);
        router.push(`/search/${encodeURIComponent(query)}?offset=${newOffset}`);
    };
    return (
        <>
            <div className="p-6 mt-20 mx-40 max-[700px]:mx-0 max-[700px]:mt-10">
                <h1 className="text-xl font-bold">Search: {decodeURIComponent(query)}</h1>
                <p className="text-sm text-gray-400 mb-4">
                    Showing {offset + 1}-{Math.min(offset + books.length, total)} of {total} results
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10">
                    {books.map((book: any) => (
                        <div key={book.key} className=" rounded text-center justify-items-center">
                            {book.cover_i === undefined ? (
                                <img
                                    src="/no-cover.jpg"
                                    alt={book.title}
                                    className="w-full md:h-80 object-contain rounded"
                                />
                            ) : (
                                <img
                                    src={`https://covers.openlibrary.org/b/id/${book.cover_i}.jpg`}
                                    alt={book.title}
                                    className="w-full md:h-80 object-contain rounded"
                                    onError={(e) => {
                                        e.currentTarget.src = '/no-cover.jpg';
                                    }}
                                />
                            )}
                            <p className="text-md mt-3">{book.title}</p>
                            <p className="text-xs mt-1 font-mono">by {book.author_name}</p>

                            {book.ia && book.ebook_access === "public" ? (
                                <a href={`https://archive.org/details/${book.ia[0]}`} target="_blank">
                                    <button className="px-3 py-1 bg-blue-600 mt-2 rounded-md shadow cursor-pointer transform transition-transform duration-150 ease-out active:scale-95 ">Read Online</button>
                                </a>
                            ) : (
                                <button className="px-3 py-1 bg-gray-600 rounded cursor-not-allowed mt-2" disabled>
                                    Not Available
                                </button>
                            )}


                        </div>
                    ))}
                </div>

                <hr className="mt-10 border-white/40" />

                <div className="flex gap-4 mt-8 justify-center">
                    {currentPage > 1 && (
                        <button onClick={handlePrev} className="px-6 py-0 bg-green-600 rounded cursor-pointer transform transition-transform duration-150 ease-out active:scale-95">
                            Previous
                        </button>
                    )}
                    <span className="px-4 md:py-2">Page {currentPage} of {totalPages}</span>
                    {offset + 100 < total && (
                        <button onClick={handleNext} className="px-6 bg-green-600 rounded cursor-pointer transform transition-transform duration-150 ease-out active:scale-95">
                            Next
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}