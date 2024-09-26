import H1 from "@/components/h1";
import Navbar from "@/components/navbar";
import { Button } from "@nextui-org/button";
import Link from "next/link";

export default function Home() {
    return (
        <>
            <Navbar></Navbar>
            <div className="container center mx-auto my-32 pt-5">
                <div className="flex items-center justify-center">
                    <div className="container text-center mx-auto pt-5">
                        <H1>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-black">Your Web Documentation Hub </span>
                        </H1>
                        <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
                            Document.io lets you easily capture and annotate web pages with notes and voice memos. Simplify collaboration and keep your team aligned with clear, accessible documentation.
                        </p>

                        <Button as={Link} href="/documentations" className="bg-emerald-700 text-white" variant="flat" radius="sm" size="lg">
                            Manage Projects
                            <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                            </svg>
                        </Button>
                    </div>
                </div>
            </div>
        </>



    );
}
