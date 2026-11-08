"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastCtx = { toast: (text: string) => void };

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function useHubToast() {
    return useContext(Ctx);
}

export function HubToastProvider({ children }: { children: React.ReactNode }) {
    const [text, setText] = useState<string | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const toast = useCallback((t: string) => {
        if (timer.current) clearTimeout(timer.current);
        setText(t);
        timer.current = setTimeout(() => setText(null), 2600);
    }, []);

    return (
        <Ctx.Provider value={{ toast }}>
            {children}
            {text && (
                <div className="hub-toast" role="status">
                    <span className="hub-toast-dot" />
                    {text}
                </div>
            )}
        </Ctx.Provider>
    );
}
