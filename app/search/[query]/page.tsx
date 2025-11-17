import Navbar from "@/components/Navbar";
import BookGrid from "@/components/BookGrid";

export default async function SearchPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ query: string }>,
  searchParams: Promise<{ offset?: string }>
}) {
  const { query } = await params;
  const { offset = '0' } = await searchParams;
  
  if (!query) return <div>Invalid query</div>;

  const offsetNum = parseInt(offset);
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=100&offset=${offsetNum}`
  );
  const data = await res.json();

  return (
    <>
      <Navbar />
      <BookGrid books={data.docs} query={query} total={data.numFound} offset={offsetNum} />
    </>
  );
}