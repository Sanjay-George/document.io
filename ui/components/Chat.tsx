import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, RefreshCcw, Send } from "lucide-react";
import { toast } from "sonner";
// import { getCurrentIdToken } from "@/lib/firebase";
// import { AI_PY_API_URL } from "@/data/kifs";

import AIMessage from "@/components/AIMessage";

const BOT = "assistant";
const USER = "user";
const MESSAGE_LIMIT = 16;

const AI_PY_API_URL = process.env.NEXT_PUBLIC_AI_PY_API_URL || "http://localhost:8000";



type Message = {
    role: string;
    content: string;
    sources?: any[];
    smartReplies?: string[];
};

export default function Chat({ projectName }: { projectName?: string }) {
    const initialMessages = [
        {
            role: BOT,
            content: projectName
                ? `Hello, how can I assist you with **${projectName}**? Ask me anything about the documentation or user flows.`
                : "Hello! How can I assist you today?",
            sources: [],
            smartReplies: [],
        },
    ];

    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const scrollBottomRef = useRef<HTMLDivElement | null>(null); // create the ref
    const [isLoading, setIsLoading] = useState(false);
    const [smartReplies, setSmartReplies] = useState<string[]>([]);


    useEffect(() => {
        // Whenever messages change, scroll to the bottom.
        if (scrollBottomRef.current) {
            scrollBottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    async function fetchDataStream() {
        if (!input.trim()) return;

        if (messages.length > MESSAGE_LIMIT) {
            toast.error("Conversation is too long. Please restart the conversation.");
            return;
        }

        const userMsg: Message = { role: USER, content: input };
        const messageHistory = [...messages, userMsg];
        setMessages((msgs) => [...msgs, userMsg]);

        setInput("");
        setSmartReplies([]);
        setIsLoading(true);

        // TODO: Add placeholder bot message for streaming
        const botMsgIndex = messageHistory.length;
        setMessages((msgs) => [
            ...msgs,
            { role: BOT, content: "", sources: [], smartReplies: [] },
        ]);

        try {
            // const idToken = await getCurrentIdToken();
            const response = await fetch(`${AI_PY_API_URL}/gensets/stream/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    query: input,
                    messageHistory:
                        messageHistory.slice(1, -1).map((message) => ({
                            content: message.content,
                            role: message.role,
                        })) || [],
                }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    toast.error("Rate limit exceeded. Please try after 1 minute.");
                } else {
                    toast.error("Error fetching insights. Please try again later.");
                }
                setIsLoading(false);
                return;
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === "content") {
                                setMessages((msgs) => {
                                    const newMsgs = [...msgs];
                                    newMsgs[botMsgIndex] = {
                                        ...newMsgs[botMsgIndex],
                                        content: newMsgs[botMsgIndex].content + data.content,
                                    };
                                    return newMsgs;
                                });
                            } else if (data.type === "sources") {
                                setMessages((msgs) => {
                                    const newMsgs = [...msgs];
                                    newMsgs[botMsgIndex] = {
                                        ...newMsgs[botMsgIndex],
                                        sources: data.sources,
                                    };
                                    return newMsgs;
                                });
                            } else if (data.type === "smart_replies") {
                                setSmartReplies(data.smartReplies);
                                setMessages((msgs) => {
                                    const newMsgs = [...msgs];
                                    newMsgs[botMsgIndex] = {
                                        ...newMsgs[botMsgIndex],
                                        smartReplies: data.smartReplies,
                                    };
                                    return newMsgs;
                                });
                            } else if (data.type === "done") {
                                setIsLoading(false);
                            }
                        } catch (e) {
                            console.error("Error parsing SSE data:", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Streaming error:", error);
            toast.error("Error fetching insights. Please try again later.");
            setIsLoading(false);
        }
    }

    const handleSend = async (e: any) => {
        e.preventDefault();
        await fetchDataStream();
    };

    return (
        <Card className="w-full mx-auto shadow-none md:shadow-xs border-0 md:border py-2 md:py-6">
            <CardContent className="h-[calc(100dvh-80px)] md:h-[calc(100dvh-170px)] relative px-0 md:px-6">
                <ScrollArea className="h-full md:pr-4">
                    <div className="flex flex-col gap-4">
                        {/* if messages has any content */}
                        {messages.map((msg, idx) =>
                            msg.content?.trim() ? (
                                <div
                                    key={idx}
                                    className={`flex items-start gap-2 ${msg.role === USER ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    {msg.role === BOT && (
                                        <Avatar className="mt-1 hidden md:inline-flex">
                                            <AvatarFallback>
                                                <Bot className="size-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div
                                        className={`rounded-lg px-3 py-2 text-sm md:max-w-[80%] 
                                            ${msg.role === USER
                                                ? "bg-muted max-w-[90%]"
                                                : "bg-transparent border border-muted leading-relaxed"
                                            }`}
                                    >
                                        {msg.role === BOT && msg.content.length > 0 ? (
                                            <AIMessage
                                                content={msg.content}
                                                id={idx}
                                                sources={msg.sources}
                                            />
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                </div>
                            ) : null
                        )}

                        {/* AI response loading skeleton */}
                        {isLoading && (
                            <div className="flex items-start gap-2">
                                <Avatar className="mt-1">
                                    <AvatarFallback>
                                        <Bot className="size-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg px-3 py-2 text-sm bg-transparent border border-muted w-[80%] leading-relaxed">
                                    <div className="flex flex-col gap-2">
                                        <Skeleton className="w-full h-[20px]" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add some empty space */}
                        <div className="h-18" />

                        {/* This div is invisible; it's just here to scroll to */}
                        <div ref={scrollBottomRef} />

                    </div>
                </ScrollArea>
                <form onSubmit={handleSend} className="mt-4 flex flex-col gap-3 absolute bottom-0 left-0 right-0 bg-card md:px-4 md:py-0">
                    <div className="w-full flex overflow-x-scroll md:flex-row-reverse scrollbar-hide md:scrollbar-thin">
                        <div className="flex gap-2 mt-3 w-fit">
                            {messages.length <= MESSAGE_LIMIT && smartReplies?.slice(0, 3).map((reply, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setInput && setInput(reply);
                                    }}
                                    type="button"
                                    className="px-3 py-1 bg-gray-100 rounded-md text-xs hover:bg-gray-200 transition-colors border-gray-300 cursor-pointer whitespace-nowrap"
                                >
                                    {reply}
                                </button>
                            ))}
                            {messages.length > MESSAGE_LIMIT && !isLoading && (
                                <div className="px-3 py-1 bg-orange-50 rounded-md text-xs text-orange-600 border border-orange-300 cursor-pointer whitespace-nowrap">
                                    Message limit reached. Please restart the chat.
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 w-full">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask your question..."
                            autoFocus
                            className="text-sm"
                            maxLength={1000}
                            disabled={isLoading || messages.length > MESSAGE_LIMIT}
                        />
                        {
                            messages.length > MESSAGE_LIMIT ? (
                                <Button className="bg-primary hover:bg-primary/80 hover:cursor-pointer" onClick={() => window.location.reload()} type="button">
                                    <RefreshCcw />
                                </Button>
                            ) : (
                                <Button className="bg-primary hover:bg-primary/80 hover:cursor-pointer" type="submit" disabled={!input.trim() || isLoading}>
                                    <Send />
                                </Button>
                            )
                        }


                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

