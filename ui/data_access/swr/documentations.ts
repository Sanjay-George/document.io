import useSWR from "swr";
import { fetcher } from "./fetcher-get";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const ALL_DOCUMENTATIONS_KEY = (id: string) =>
    `${API_URL}/projects/${id}/documentations`;

export const SINGLE_DOCUMENTATION_KEY = (id: string) =>
    `${API_URL}/documentations/${id}`;

export const useDocumentations = (id: string): { data: any[], isLoading: boolean, error: any } =>
    useSWR(ALL_DOCUMENTATIONS_KEY(id), fetcher);

export const useDocumentation = (id: string): { data: any | null, isLoading: boolean, error: any } => {
    if (!id) {
        useSWR(null);
        return { data: null, isLoading: false, error: 'ID not provided' };
    }
    return useSWR(SINGLE_DOCUMENTATION_KEY(id), fetcher);
}