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
 * Get the title of an annotation from its value
 * @param value The string value of the annotation
 * @param maxLength Maximum length of the title (Returns a truncated title if the length exceeds this value)
 * @returns 
 */
export const renderTitleFromValue = (value: string, maxLength: number) => {
    if (!value || !value.length) {
        return '';
    }
    const maxParseLength = 1000;
    const title = removeMarkdownSyntax(value.slice(0, maxParseLength)).split('\n')[0];
    if (!title.length) {
        return '';
    }
    return title.length > maxLength ? title.slice(0, maxLength - 3) + '...' : title;
};

/**
 * Remove Markdown syntax from a string and return plain text
 * @param markdown The string containing Markdown syntax
 * @returns A plain text string without Markdown syntax
 */
function removeMarkdownSyntax(markdown: string): string {
    return markdown
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
        .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
        .replace(/`{1,3}.*?`{1,3}/g, '') // Remove inline and block code
        .replace(/[*_~`>#+=-]/g, '') // Remove Markdown special characters
        .replace(/!\[.*?\]/g, '') // Remove alt text for images
        .replace(/^\s*[\r]/gm, '') // Remove empty lines
        .trim(); // Trim leading and trailing whitespace
}


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