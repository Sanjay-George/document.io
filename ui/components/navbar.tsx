"use client"
import { Button } from "@nextui-org/button";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GithubIcon from "./icons/gh_icon";
import ButtonPrimary from "./ButtonPrimary";
import RightArrowIcon from "./icons/right_arrow";
import DocumentIcon from "./icons/DocumentIcon";


const links = [
    { name: "Projects", href: "/projects" },
    // { name: "Teams", href: "#" },
    // { name: "Integrations", href: "#" },
];
export default function Nav() {
    const pathname = usePathname();
    return (
        <Navbar className="border-b-1 border-b-slate-50">
            <NavbarBrand className=" text-slate-500  hover:text-primary">
                <Link href='/' className="flex items-center">
                    {/* <div className="me-1"><DocumentIcon /></div> */}
                    <p className="font-bold ">DOCUMENT.<span className="text-accent">IO</span></p>
                </Link>
            </NavbarBrand>

            <NavbarContent className="hidden sm:flex gap-6" justify="center">
                {links.map((link) => (
                    <NavbarItem key={link.name} isActive={link.href === pathname}>
                        <Link className="text-slate-500 hover:text-primary text-sm" href={link.href}>{link.name}</Link>
                    </NavbarItem>
                ))}
            </NavbarContent>

            <NavbarContent justify="end">
                <NavbarItem className="hidden lg:flex">
                    <a href="https://github.com/Sanjay-George/document.io" target="_blank" className="text-slate-500 hover:text-primary"><GithubIcon /></a>
                </NavbarItem>
                <NavbarItem>

                    <Button as={Link} href="https://github.com/Sanjay-George/document.io-chrome-extension"
                        target="_blank" variant="flat" size="sm" className="text-slate-500 bg-transparent hover:text-primary text-sm py-3 ml-0 px-0">Get Companion App <RightArrowIcon /></Button>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}