// jsdom does not implement the `CSS` namespace object, but anchor resolution
// relies on `CSS.escape` (available natively in the extension's browser
// environment). Provide the standard CSSOM serialization polyfill for tests.
if (typeof globalThis.CSS === 'undefined' || typeof globalThis.CSS.escape !== 'function') {
    const escape = (value: string): string => {
        const str = String(value);
        const length = str.length;
        let result = '';
        let index = -1;
        const firstCodeUnit = str.charCodeAt(0);
        while (++index < length) {
            const codeUnit = str.charCodeAt(index);
            if (codeUnit === 0x0000) {
                result += '�';
                continue;
            }
            if (
                (codeUnit >= 0x0001 && codeUnit <= 0x001f) ||
                codeUnit === 0x007f ||
                (index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
                (index === 1 && codeUnit >= 0x0030 && codeUnit <= 0x0039 && firstCodeUnit === 0x002d)
            ) {
                result += '\\' + codeUnit.toString(16) + ' ';
                continue;
            }
            if (index === 0 && length === 1 && codeUnit === 0x002d) {
                result += '\\' + str.charAt(index);
                continue;
            }
            if (
                codeUnit >= 0x0080 ||
                codeUnit === 0x002d ||
                codeUnit === 0x005f ||
                (codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
                (codeUnit >= 0x0041 && codeUnit <= 0x005a) ||
                (codeUnit >= 0x0061 && codeUnit <= 0x007a)
            ) {
                result += str.charAt(index);
                continue;
            }
            result += '\\' + str.charAt(index);
        }
        return result;
    };
    globalThis.CSS = { ...(globalThis.CSS ?? {}), escape } as typeof globalThis.CSS;
}
