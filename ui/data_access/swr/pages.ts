import useSWR from "swr";
import { fetcher } from "./fetcher-get";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const ALL_PAGES_KEY = (documentationId: string) =>
    `${API_URL}/documentations/${documentationId}/pages`;

export const SINGLE_PAGE_KEY = (pageId: string) =>
    `${API_URL}/pages/${pageId}`;

// Fetch all pages by documentationId
export const usePages = (documentationId: string): { data: any[], isLoading: boolean, error: any } =>
    useSWR(ALL_PAGES_KEY(documentationId), fetcher);

// Fetch a single page
export const usePage = (pageId: string): { data: any | null, isLoading: boolean, error: any } => {
    if (!pageId) {
        useSWR(null);
        return { data: null, isLoading: false, error: 'ID not provided' };
    }
    return useSWR(SINGLE_PAGE_KEY(pageId), fetcher);
}