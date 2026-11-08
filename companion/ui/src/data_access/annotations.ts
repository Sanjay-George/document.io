import useSWR from "swr";
import { fetch, fetcher } from "./fetcher";
import { Annotation } from "@/models/annotations";

// TODO: setup vite env variables
const API_URL = (import.meta.env.VITE_APP_ENV === 'development')
    ? 'http://localhost:5001'
    : '';

// Keys
export const ALL_ANNOTATIONS_KEY = (documentationId: string) =>
    `${API_URL}/documentations/${documentationId}/annotations`;

export const ANNOTATIONS_BY_TARGET_KEY = (documentationId: string, target: string) =>
    `${API_URL}/documentations/${documentationId}/annotations?target=${encodeURIComponent(target)}`;

export const SINGLE_ANNOTATION_KEY = (annotationId: string) =>
    `${API_URL}/annotations/${annotationId}`;


// Methods

export const useAnnotations = (documentationId: string): { data: any[], isLoading: boolean, error: any } => {
    if (!documentationId) {
        useSWR(null);
        return { data: [], isLoading: false, error: 'Documentation ID not provided' };
    }
    return useSWR(ALL_ANNOTATIONS_KEY(documentationId), fetcher);
}

export const useAnnotationsByTarget = (documentationId: string, target: string | null): { data: Annotation[], isLoading: boolean, error: any } => {
    if (!documentationId) {
        useSWR(null);
        return { data: [], isLoading: false, error: 'Documentation ID not provided' };
    }
    if (!target) {
        return useAnnotations(documentationId);
    }
    return useSWR(ANNOTATIONS_BY_TARGET_KEY(documentationId, target), fetcher)
};

export const useAnnotation = (annotationId: string): { data: any, isLoading: boolean, error: any } => {
    if (!annotationId) {
        useSWR(null);
        return { data: null, isLoading: false, error: 'Annotation ID not provided' };
    }
    return useSWR(SINGLE_ANNOTATION_KEY(annotationId), fetcher);
}

export const addAnnotation = async (annotation: Annotation) => {
    await fetch(`${API_URL}/annotations/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(annotation)
    });
}

export const updateAnnotation = async (annotationId: string, annotation: Annotation) => {
    await fetch(`${API_URL}/annotations/${annotationId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(annotation)
    });
}

export const updateAnnotations = async (annotations: Annotation[]) => {
    await fetch(`${API_URL}/annotations/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(annotations)
    });
}

export const deleteAnnotation = async (annotationId: string) => {
    await fetch(`${API_URL}/annotations/${annotationId}`, {
        method: 'DELETE'
    });
}