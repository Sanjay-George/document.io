import useSWR from "swr";
import { fetcher } from "./fetcher-get";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const ALL_PROJECTS_KEY = `${API_URL}/projects/`;
export const SINGLE_PROJECT_KEY = (id: string) => `${API_URL}/projects/${id}`;

// Fetch all projects
export const useProjects = (): { data: any[], isLoading: boolean, error: any } =>
    useSWR(ALL_PROJECTS_KEY, fetcher);

// Fetch single project
export const useProject = (id: string): { data: any | null, isLoading: boolean, error: any } => {
    if (!id) {
        useSWR(null);
        return { data: null, isLoading: false, error: 'ID not provided' };
    }
    return useSWR(SINGLE_PROJECT_KEY(id), fetcher);
}
