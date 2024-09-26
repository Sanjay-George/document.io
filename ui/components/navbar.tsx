"use client"
import { Button } from "@nextui-org/button";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GithubIcon from "./icons/gh_icon";


const links = [
    { name: "Projects", href: "/projects" },
    // { name: "Teams", href: "#" },
    // { name: "Integrations", href: "#" },
];
export default function Nav() {
    const pathname = usePathname();
    return (
        <Navbar>
            <NavbarBrand>
                {/* <Logo /> */}
                <Link href='/'><p className="font-bold text-inherit text-emerald-600">DOCUMENT.IO</p></Link>
            </NavbarBrand>

            <NavbarContent className="hidden sm:flex gap-6" justify="center">
                {links.map((link) => (
                    <NavbarItem key={link.name} isActive={link.href === pathname}>
                        <Link color="foreground" href={link.href}>{link.name}</Link>
                    </NavbarItem>
                ))}
            </NavbarContent>

            <NavbarContent justify="end">
                <NavbarItem className="hidden lg:flex">
                    <a href="https://github.com/Sanjay-George/document.io" target="_blank"><GithubIcon /></a>
                </NavbarItem>
                <NavbarItem>
                    <Button as={Link}
                        href="https://github.com/Sanjay-George/document.io-chrome-extension"
                        target="_blank"
                        className="bg-emerald-700 bg-slate-700 text-white"
                        variant="flat" radius="full">
                        Download Extension
                    </Button>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}