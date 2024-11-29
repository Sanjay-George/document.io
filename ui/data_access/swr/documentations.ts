import useSWR from "swr";
import { fetcher } from "./fetcher-get";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const ALL_DOCUMENTATIONS_KEY = (documentationId: string) =>
    `${API_URL}/documentations/${documentationId}/pages`;

export const SINGLE_DOCUMENTATION_KEY = (pageId: string) =>
    `${API_URL}/pages/${pageId}`;

export const useDocumentations = (documentationId: string): { data: any[], isLoading: boolean, error: any } =>
    useSWR(ALL_DOCUMENTATIONS_KEY(documentationId), fetcher);

export const useDocumentation = (pageId: string): { data: any | null, isLoading: boolean, error: any } => {
    if (!pageId) {
        useSWR(null);
        return { data: null, isLoading: false, error: 'ID not provided' };
    }
    return useSWR(SINGLE_DOCUMENTATION_KEY(pageId), fetcher);
}