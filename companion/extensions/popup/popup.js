const { RUNTIME_REQUEST } = globalThis.DOCIO_MESSAGES;

const input = document.getElementById("host");
const saveBtn = document.getElementById("save");
const statusEl = document.getElementById("status");

// Load the current host on open
chrome.runtime.sendMessage({ type: RUNTIME_REQUEST.getApiHost }, (res) => {
    if (res?.host) input.value = res.host;
});

saveBtn.addEventListener("click", () => {
    const host = input.value.trim().replace(/\/+$/, "");
    if (!host) {
        statusEl.textContent = "Please enter a valid URL.";
        statusEl.style.color = "#b03024"; // --danger-text
        return;
    }
    chrome.runtime.sendMessage({ type: RUNTIME_REQUEST.setApiHost, host }, () => {
        statusEl.textContent = "Saved!";
        statusEl.style.color = "#2e8b63"; // --success-text
        setTimeout(() => { statusEl.textContent = ""; }, 2500);
    });
});