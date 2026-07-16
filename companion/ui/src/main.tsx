import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// TODO: Separate styles for shadow dom and root in App.css
import './App.css';

// Shadow DOM specific styles
import indexStyles from './index.css?inline';
import AppStyles from './App.css?inline';
import fontStyles from './companion/fonts.css?inline';

import CompanionContainer from './companion/CompanionContainer.tsx'

// If in development mode, render the sample website for testing
if (import.meta.env.VITE_APP_ENV === 'development') {
  const { default: SampleSite } = await import('../samples/SampleSite.tsx');
  document.getElementById('document-io-root')?.insertAdjacentHTML(
    "beforebegin",
    `<div id="sample-site"></div>`
  );
  createRoot(document.getElementById('sample-site')!).render(
    <SampleSite />
  );
}

const mountPoint = document.getElementById('document-io-root');
const shadowRoot = mountPoint!.attachShadow({ mode: 'open' });

const fontStyle = document.createElement("style");
fontStyle.textContent = fontStyles;
shadowRoot.appendChild(fontStyle);

const indexStyle = document.createElement("style");
indexStyle.textContent = indexStyles;
shadowRoot.appendChild(indexStyle);

const appStyle = document.createElement("style");
appStyle.textContent = AppStyles;
shadowRoot.appendChild(appStyle);

const rootContainer = document.createElement("div");
shadowRoot.appendChild(rootContainer);

// Keyboard events bubble out of the shadow tree to the host page, where the
// target is retargeted to our host div (not an <input>). Host shortcut handlers
// (e.g. GitHub's "s"/"/" search hotkeys) then fire and steal focus mid-typing.
// Stop key events at the shadow boundary so the host never sees them; React's
// own root listener on this container still runs, so our inputs keep working.
for (const type of ['keydown', 'keyup', 'keypress'] as const) {
  rootContainer.addEventListener(type, (e) => e.stopPropagation());
}

createRoot(rootContainer).render(
  <StrictMode>
    <CompanionContainer />
  </StrictMode>
)
