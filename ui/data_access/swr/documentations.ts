import useSWR from "swr";
import { fetcher } from "./fetcher-get";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const ALL_DOCUMENTATIONS_KEY = `${API_URL}/documentations/`;
export const SINGLE_DOCUMENT_KEY = (id: string) => `${API_URL}/documentations/${id}`;

// Fetch all documentations
export const useDocumentations = (): { data: any[], isLoading: boolean, error: any } =>
    useSWR(ALL_DOCUMENTATIONS_KEY, fetcher);

// Fetch single documentation
export const useDocumentation = (id: string): { data: any | null, isLoading: boolean, error: any } => {
    if (!id) {
        useSWR(null);
        return { data: null, isLoading: false, error: 'ID not provided' };
    }
    return useSWR(SINGLE_DOCUMENT_KEY(id), fetcher);
}
