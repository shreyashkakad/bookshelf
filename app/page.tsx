import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Image from "next/image"

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex-col items-center justify-center text-center mx-[30%] mt-[10%] mb-[5%] max-[700px]:mx-[5%] max-[700px]:mt-[30%]">
        <h1 className="text-4xl font-medium max-[700px]:text-xl">Find books worth remembering.</h1>
        <p className="font-light text-lg text-white/95 max-[700px]:text-sm">Because screenshots of book covers don’t count.</p>
      </div>
      <div className="mx-[30%] items-center text-center text-xl max-[700px]:mx-[5%] max-[700px]:mt-[10%]">
        <p className="font-regular text-white/90 max-[700px]:font-medium max-[700px]:text-sm">Search books and add them to your reading list. <br />
          Check reviews, read summaries, and track what you love.</p>
      </div>

      <div className="mx-[32%] mt-[4%] flex justify-between max-[700px]:mx-[15%] max-[700px]:mt-[12%] max-[700px]:flex-col max-[700px]:gap-3">
        <div className="p-3 flex items-center rounded-xl border border-white/20">
          <span className="inline-flex items-center justify-center bg-purple-900/15 p-3 rounded-xl">
            <Image src="/plus-solid.svg" alt="plusIcon" width={16} height={16} className="block" />
          </span>
          <div className="ml-2">
            <p className="text-sm font-bold">Add to shelf</p>
            <p className="text-xs font-medium">Save books you want to read</p>
          </div>
        </div>

        <div className="p-3 flex items-center rounded-xl border border-white/20">
          <span className="inline-flex items-center justify-center p-3 rounded-xl bg-orange-900/15">
            <Image src="/magnifying-glass-solid.svg" alt="plusIcon" width={16} height={16} className="block" />
          </span>
          <div className="ml-2">
            <p className="text-sm font-bold">Explore Books</p>
            <p className="text-xs font-medium">Find your next favourite story</p>
          </div>
        </div>
      </div>

      <div className="mx-[30%] mt-8 flex justify-center max-[700px]:mx-[15%]">
        <button
          className="bg-white py-2 px-4 flex items-center gap-2 text-black rounded-md shadow cursor-pointer transform transition-transform duration-150 ease-out active:scale-95"
        >
          <Image src="/user-plus-solid.svg" alt="userSignIn" width={20} height={20} className="h-4 w-4" />
          <span className="font-medium">Get Started!</span>
        </button>
      </div>

      <Footer />
    </>
  )
}