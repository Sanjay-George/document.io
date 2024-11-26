import H1 from "@/components/H1";
import Navbar from "@/components/Navbar";
import ButtonAccent from "@/components/ButtonAccent";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import RightArrowIcon from "@/components/icons/right_arrow";
import ButtonPrimary from "@/components/ButtonPrimary";

export default function Home() {
    return (
        <>
            <Navbar></Navbar>
            <div className="container center mx-auto my-32 pt-5">
                <div className="flex items-center justify-center">
                    <div className="container text-center mx-auto pt-5">
                        <H1>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r to-primary from-slate-700 font-semibold">Your Web Documentation Hub </span>
                        </H1>
                        <p className="mb-14 text-lg font-light text-slate-400 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
                            Document.io lets you easily capture and annotate web pages with notes and voice memos. Simplify collaboration and keep your team aligned with clear, accessible documentation.
                        </p>

                        <ButtonPrimary href="/projects" text="Manage Projects" icon={<RightArrowIcon />} />

                    </div>
                </div>
            </div>
        </>



    );
}
