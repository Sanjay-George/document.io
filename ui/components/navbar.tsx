"use client"
import { Button } from "@nextui-org/button";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GithubIcon from "./icons/gh_icon";
import ButtonPrimary from "./ButtonPrimary";
import RightArrowIcon from "./icons/right_arrow";


const links = [
    { name: "Projects", href: "/projects" },
    // { name: "Teams", href: "#" },
    // { name: "Integrations", href: "#" },
];
export default function Nav() {
    const pathname = usePathname();
    return (
        <Navbar className="border-b-1 border-b-slate-50 py-2">
            <NavbarBrand>
                {/* <Logo /> */}
                <Link href='/'><p className="font-bold text-slate-500">DOCUMENT.<span className="text-accent">IO</span></p></Link>
            </NavbarBrand>

            <NavbarContent className="hidden sm:flex gap-6" justify="center">
                {links.map((link) => (
                    <NavbarItem key={link.name} isActive={link.href === pathname}>
                        <Link className="text-slate-400 hover:text-slate-600" href={link.href}>{link.name}</Link>
                    </NavbarItem>
                ))}
            </NavbarContent>

            <NavbarContent justify="end">
                <NavbarItem className="hidden lg:flex">
                    <a href="https://github.com/Sanjay-George/document.io" target="_blank"><GithubIcon /></a>
                </NavbarItem>
                <NavbarItem>
                    <Button as={Link} href="https://github.com/Sanjay-George/document.io-chrome-extension"
                        target="_blank" variant="light" className="text-slate-500">Get Companion App <RightArrowIcon /></Button>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}