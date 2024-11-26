import { Button } from "@nextui-org/button";
import Link from "next/link";


export default function ButtonAccent({ text, icon, onClick, href, target }: { text: string, icon: React.ReactNode, onClick?: () => void, href?: string, target?: string }) {

    if (href) {
        return (
            <Button as={Link} href={href} target={target || '_self'} className="text-accent border-accent border-1 bg-transparent hover:bg-accent hover:text-white" variant="flat" radius="sm" size="md">
                {text}
                {icon}
            </Button>
        )
    }
    else if (onClick) {
        return (
            <Button onClick={onClick} className="text-accent border-accent border-1 bg-transparent hover:bg-accent hover:text-white" variant="flat" radius="sm" size="md">
                {text}
                {icon}
            </Button>
        )
    }

    else {
        return (
            <Button className="text-accent border-accent border-1 bg-transparent hover:bg-accent hover:text-white" variant="flat" radius="sm" size="md">
                {text}
                {icon}
            </Button>
        )
    }

}