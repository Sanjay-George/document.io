import { Button } from "@nextui-org/button";


export default function PrimaryBtn({ text, icon, onClick, }: { text: string, icon: React.ReactNode, onClick: () => void }) {
    return (
        <Button className="bg-emerald-700 text-white" variant="solid" radius="sm" size="md" onClick={onClick}>
            {text}
            {icon}
        </Button>
    )
}