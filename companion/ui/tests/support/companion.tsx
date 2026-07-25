import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { vi } from 'vitest';
import CompanionContainer from '@/companion/CompanionContainer';

/**
 * Integration harness that mounts the real `CompanionContainer` the way
 * production does — inside an **open shadow root** under `#document-io-root`
 * (see `main.tsx`). Two things depend on that fidelity:
 *   - the page's MutationObserver watches `document.body`, which cannot see into
 *     a shadow tree, so the companion's own DOM never feeds its own watcher;
 *   - `isOwn` (`el.closest('#document-io-root')`) resolves via event retargeting.
 *
 * The harness absorbs the jsdom gaps that would otherwise hide every pin
 * (`getBoundingClientRect` returns 0×0 → `HostOverlay` drops the note) and
 * exposes a pin count + poller. The annotation *data* is intentionally NOT owned
 * here — each test declares its own `vi.mock('@/data_access/…')` so the fixture
 * stays visible in the test body.
 */

const PIN_SELECTOR = 'button.rounded-dio-badge';

const NONZERO_RECT: DOMRect = {
    top: 40, left: 40, width: 200, height: 80, bottom: 120, right: 240, x: 40, y: 40,
    toJSON: () => ({}),
} as DOMRect;

export interface CompanionHandle {
    /** The shadow root the companion is rendered into. */
    shadow: ShadowRoot;
    /** Number of on-page pins currently rendered. */
    pinCount(): number;
    /** Resolve once exactly `n` pins are rendered, or throw after `timeoutMs`. */
    waitForPins(n: number, timeoutMs?: number): Promise<void>;
    /** Unmount React, remove the host element, and restore the jsdom stubs. */
    unmount(): void;
}

/** Mount `<CompanionContainer/>` into a production-shaped shadow root. */
export async function mountCompanion(opts: { docId?: string } = {}): Promise<CompanionHandle> {
    const { docId = 'doc-1' } = opts;

    // VITE_APP_ENV=development makes the container self-assign a test doc id and
    // render the sample site — pin it to a neutral value for tests.
    vi.stubEnv('VITE_APP_ENV', 'test');
    // jsdom has no layout; without a non-zero rect HostOverlay.measure() drops
    // every note as zero-sized and no pin ever renders.
    const rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(NONZERO_RECT);

    const host = document.createElement('div');
    host.id = 'document-io-root';
    host.setAttribute('data-documentation-id', docId);
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });

    let root: Root;
    let unmounted = false;
    await act(async () => {
        root = createRoot(shadow);
        root.render(<CompanionContainer />);
    });

    const pinCount = () => shadow.querySelectorAll(PIN_SELECTOR).length;

    return {
        shadow,
        pinCount,
        async waitForPins(n, timeoutMs = 4500) {
            const deadline = Date.now() + timeoutMs;
            while (Date.now() < deadline) {
                if (pinCount() === n) return;
                await act(async () => {
                    await new Promise((resolve) => setTimeout(resolve, 25));
                });
            }
            throw new Error(`expected ${n} pins, saw ${pinCount()} after ${timeoutMs}ms`);
        },
        unmount() {
            if (unmounted) return; // idempotent — tests may unmount then afterEach again
            unmounted = true;
            act(() => root.unmount());
            host.remove();
            rectSpy.mockRestore();
            vi.unstubAllEnvs();
        },
    };
}
