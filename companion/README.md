# Document.io - Companion Extension

Chrome and Edge extension companion for [document.io](https://github.com/Sanjay-George/document.io), built for seamless website annotation.

![screely-1736026495039](https://github.com/user-attachments/assets/ce662841-0d6c-4f37-a9a9-1f901253af69)

More functionalities are [showcased here...](https://github.com/Sanjay-George/document.io-companion/wiki/Showcase)

## 🚀 Quick Start

#### Prerequisite
- **Node.js** (v20+): [Download Node.js](https://nodejs.org/)

#### 1. Clone the repository

The companion lives inside the [document.io](https://github.com/Sanjay-George/document.io) repo under `companion/`.

```bash
git clone https://github.com/Sanjay-George/document.io.git
cd document.io/companion
```

#### 2. Install dependencies

```bash
npm install
cd ui && npm install && cd ..
```

#### 3. Build the extension

```bash
npm run build
```

#### 4. Load in Chrome or Edge
1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extensions` folder

## Notes
- Requires a running [document.io](https://github.com/Sanjay-George/document.io) instance.
- Build output for the UI is copied to `extensions/dist`.
- For UI-focused development details, see [ui/README.md](./ui/README.md).

