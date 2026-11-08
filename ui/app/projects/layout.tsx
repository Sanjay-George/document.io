import "../hub.css";
import HubTopBar from "@/components/hub/HubTopBar";
import { HubToastProvider } from "@/components/hub/toast";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="hub-scope">
            <HubToastProvider>
                <HubTopBar />
                {children}
            </HubToastProvider>
        </div>
    );
}
