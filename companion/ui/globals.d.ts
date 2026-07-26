interface Window {
    electronAPI: {
        fetch: (url: string, options?: RequestInit) => Promise<any>;
        onNavigationUpdate: (callback: () => void) => void;
    };
    documentioAPI: {
        fetch: (url: string, options?: RequestInit) => Promise<any>;
    }
}