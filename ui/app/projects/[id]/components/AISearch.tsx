import { Button } from "@heroui/button";
import { Bot } from "lucide-react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
} from "@heroui/drawer";
import { useState } from "react";
import Chat from "@/components/Chat";

export default function AISearch({ projectName }: { projectName?: string }) {
    const [isOpen, setIsOpen] = useState(false);

    const onOpenChange = (open: boolean) => {
        setIsOpen(open);
    };

    return (
        <>
            <Button
                onPress={() => setIsOpen(true)}
                isIconOnly
                className="fixed bottom-6 right-6 z-50 shadow-xl bg-[#DD6234] hover:bg-[#C9542A]
                text-white border-none rounded-full" variant="solid" size="lg">
                <Bot size={20} />
            </Button>

            <Drawer isOpen={isOpen} onOpenChange={onOpenChange}
                size="full" placement="bottom"
                isDismissable={false}
                isKeyboardDismissDisabled={true}
            >
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="flex flex-col mb-4 pb-0">
                                <p className="font-bold text-xs uppercase text-[#DD6234] mb-1">AI Search</p>
                                <p className="text-slate-400 font-light text-sm">Search this project with AI and create custom userflow documentations.</p>
                            </DrawerHeader>
                            <DrawerBody className="pt-0">
                                <Chat projectName={projectName} />
                            </DrawerBody>
                        </>
                    )}
                </DrawerContent>
            </Drawer >
        </>
    )
}