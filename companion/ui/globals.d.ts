interface Window {
    electronAPI: {
        fetch: (url: string, options?: RequestInit) => Promise<any>;
        onNavigationUpdate: (callback: () => void) => void;
    };
    documentioAPI: {
        fetch: (url: string, options?: RequestInit) => Promise<any>;
        /** Fetch an arbitrary asset (CORS-bypassed via the extension) as base64. */
        fetchAssetForExport?: (url: string) => Promise<{ contentType: string; base64: string }>;
    }
    /**
     * Present only inside an exported, self-contained HTML file. Its presence puts
     * the companion in offline, read-only mode: annotation data is read from here
     * instead of the network, and all editing affordances are hidden.
     */
    __DOCIO_EXPORT__?: {
        documentation: { id?: string; title?: string };
        annotations: import('./src/models/annotations').Annotation[];
    };
}