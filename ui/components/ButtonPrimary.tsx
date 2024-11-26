import { Button } from "@nextui-org/button";
import Link from "next/link";


export default function ButtonPrimary({ text, icon, onClick, href, target }: { text: string, icon: React.ReactNode, onClick?: () => void, href?: string, target?: string }) {

    if (href) {
        return (
            <Button as={Link} href={href} target={target || '_self'} className="text-primary border-primary border-1 bg-transparent hover:bg-primary hover:text-white" variant="flat" radius="sm" size="md">
                {text}
                {icon}
            </Button>
        )
    }
    else if (onClick) {
        return (
            <Button onClick={onClick} className="text-primary border-primary border-1 bg-transparent hover:bg-primary hover:text-white" variant="flat" radius="sm" size="md">
                {text}
                {icon}
            </Button>
        )
    }

    else {
        return (
            <Button className="text-primary border-primary border-1 bg-transparent hover:bg-primary hover:text-white" variant="flat" radius="sm" size="md">
                {text}
                {icon}
            </Button>
        )
    }

}