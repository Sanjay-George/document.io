import Navbar from "@/components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {

    return (
        <>
            <Navbar />
            <div className="container mx-auto pt-5">
                {children}
            </div>
        </>

    )
}