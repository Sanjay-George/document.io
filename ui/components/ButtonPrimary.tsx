import { Button } from "@nextui-org/button";
import Link from "next/link";


export default function ButtonPrimary({ text, icon, onClick, href, target }: { text: string, icon: React.ReactNode, onClick?: () => void, href?: string, target?: string }) {

    if (href) {
        return (
            <Button as={Link}
                href={href} target={target || '_self'} className="bg-primary text-white border-none py-3 px-4 text-sm rounded-md" variant="solid" size="sm">
                {text}
                {icon}
            </Button>
        )
    }
    else if (onClick) {
        return (
            <Button onClick={onClick} className="bg-primary text-white border-none py-3 px-4 text-sm rounded-md" variant="solid" size="sm">
                {text}
                {icon}
            </Button>
        )
    }

    else {
        return (
            <Button type="submit" className="bg-primary text-white border-none py-3 px-4 text-sm rounded-md" variant="solid" size="sm">
                {text}
                {icon}
            </Button>
        )
    }

}