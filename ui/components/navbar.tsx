"use client"
import { Button } from "@nextui-org/button";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";


const links = [
    { name: "Documentations", href: "/documentations" },
    { name: "Teams", href: "#" },
    { name: "Integrations", href: "#" },
];
export default function Nav() {
    const pathname = usePathname();

    return (
        <Navbar>
            <NavbarBrand>
                {/* <Logo /> */}
                <Link href='/'><p className="font-bold text-inherit text-emerald-600">DOCUMENT.IO</p></Link>
            </NavbarBrand>

            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                {links.map((link) => (
                    <NavbarItem key={link.name} isActive={link.href === pathname}>
                        <Link color="foreground" href={link.href}>{link.name}</Link>
                    </NavbarItem>
                ))}
            </NavbarContent>

            <NavbarContent justify="end">
                <NavbarItem className="hidden lg:flex">
                    <Link href="#">Login</Link>
                </NavbarItem>
                <NavbarItem>
                    <Button as={Link} className="bg-emerald-700 bg-zinc-800 text-white" href="#" variant="flat" radius="full">
                        Sign Up
                    </Button>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}