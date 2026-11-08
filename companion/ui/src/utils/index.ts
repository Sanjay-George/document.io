import { Annotation } from "@/models/annotations";
import { HOVERED_ELEMENT_CLASS } from "./constants";

export function sortAnnotations(annotations: Annotation[]): Annotation[] {
   return [...annotations].sort((a, b) => {
        return a.index - b.index;
    });
};

export const renderAnnotationId = (id: string) => {
    return `#${id?.slice(-5)}`;
};

/**
 * Function to get the query selector of an element
 * @param element 
 * @returns 
 */
export function getQuerySelector(element: HTMLElement): string {
    if (!(element instanceof Element)) {
        throw new Error('The provided input is not a DOM element');
    }
    function getPathTo(element: HTMLElement) {
        if (element.id) {
            return `#${CSS.escape(element.id)}`;
        }

        if (element === document.body) {
            return 'body';
        }

        let path = [] as string[];
        while (element.nodeType === Node.ELEMENT_NODE) {
            let selector = element.nodeName.toLowerCase() as string;
            if (element.className && typeof element.className === 'string') {
                const classSelector = `${(Array.from(element.classList) as string[])
                    .filter(i => i.trim().length > 0)
                    .filter(i => i !== HOVERED_ELEMENT_CLASS) // TODO: extend to other classes reserved for annotations
                    .map(i => CSS.escape(i))
                    .join('.')}`;
                classSelector.length > 0 && (selector += `.${classSelector}`);
            }
            if (element !== document.documentElement) {
                let sibling = element;
                let nth = 1;
                while (sibling = sibling.previousElementSibling as any) {
                    if (sibling.nodeName.toLowerCase() === selector.split('.')[0]) {
                        nth++;
                    }
                }
                selector += `:nth-of-type(${nth})`;
            }
            path.unshift(selector);
            element = element.parentNode as any;

            if (document.querySelectorAll(path.join(' > ')).length === 1) {
                break;
            }
        }
        return path.join(' > ');
    }
    return getPathTo(element);
}



/**
 * Debounce function 
 * @param func Function to be debounced
 * @param wait Time to wait before calling the function
 * @param immediate If true, the function will be called immediately
 * @returns
 */
export function debounce(func: Function, wait: number, immediate: boolean = false) {
    let timeout: any;
    return function () {
        // @ts-ignore
        const context = this;
        const args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}