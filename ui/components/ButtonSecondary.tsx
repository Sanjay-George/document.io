import { Button } from "@heroui/button";
import Link from "next/link";


export default function ButtonSecondary({ text, icon, onClick, href, target }: { text: string, icon: React.ReactNode, onClick?: () => void, href?: string, target?: string }) {

    if (href) {
        return (
            <Button as={Link}
                href={href} target={target || '_self'} className="bg-primary/5 text-primary border border-primary/50 py-3 px-4 text-sm rounded-md" variant="solid" size="sm">
                {text}
                {icon}
            </Button>
        )
    }
    else if (onClick) {
        return (
            <Button onClick={onClick} className="bg-primary/5 text-primary border border-primary/50 py-3 px-4 text-sm rounded-md" variant="solid" size="sm">
                {text}
                {icon}
            </Button>
        )
    }

    else {
        return (
            <Button type="submit" className="bg-primary/5 text-primary border border-primary/50 py-3 px-4 text-sm rounded-md" variant="solid" size="sm">
                {text}
                {icon}
            </Button>
        )
    }

}