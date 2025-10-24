
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Copy, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function AIMessage({
    content,
    id,
    sources,
}: {
    content: string;
    id: number;
    sources?: any[];
}) {
    return (
        <>
            <div className="markdown flex flex-col gap-2 w-[300px] max-w-[300px] sm:w-full sm:max-w-full">
                <div className="overflow-x-auto">
                    <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
                </div>
            </div>

            {id > 1 && (
                <div className="flex border-t border-gray-100 mt-3 pt-1">
                    <Button
                        variant="link"
                        size="sm"
                        className="text-gray-400 hover:text-gray-800 cursor-pointer"
                        onClick={() => {
                            navigator.clipboard.writeText(content);
                            toast.success("Copied to clipboard");
                        }}
                    >
                        <Copy className="size-3" />
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="link"
                                size="sm"
                                className="text-gray-400 hover:text-gray-800 cursor-pointer"
                            >
                                <Link className="size-3" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="lg:min-w-[950px] max-h-[90dvh] overflow-y-scroll">
                            <DialogHeader>
                                <DialogTitle>Sources</DialogTitle>
                                <DialogDescription>
                                    Following sources were used to generate this response
                                </DialogDescription>

                                {!!sources &&
                                    sources?.map((source, index) => (
                                        <Card key={index} className="my-1">
                                            <CardContent className="text-xs">
                                                <CardDescription className="text-gray-800 font-semibold mb-2">
                                                    Source {index + 1}
                                                </CardDescription>
                                                {/* <p>{source.pageContent}</p> */}
                                                <Markdown remarkPlugins={[remarkGfm]}>
                                                    {source.pageContent}
                                                </Markdown>
                                                <p className="text-gray-400 mt-1">
                                                    {source.metadata?.pdf?.info?.Author} |{" "}
                                                    {source.metadata?.gensetName ||
                                                        source.metadata?.source.split("/").slice(-1)}{" "}
                                                    | Page{" "}
                                                    {source.metadata?.loc?.pageNumber ||
                                                        source.metadata?.page}{" "}
                                                    | {source.metadata?.loc?.lines?.from} -{" "}
                                                    {source.metadata?.loc?.lines?.to} | Score:{" "}
                                                    {source.score.toFixed(4)}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </>
    );
}
