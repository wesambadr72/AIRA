# AIRA — AI Research Assistant 🚀

**AIRA** is a chat-first, responsive AI Research Assistant designed to analyze documents, surface critical evidence, run metrics comparison, and help users make faster, data-driven decisions within a secured data sandbox.

---

## 🗺️ Overview / نظرة عامة
AIRA serves as a bridge between static multi-format documents and actionable executive intelligence. Users can upload their documents directly into a workspace, trigger quick analytical queries (Summarize, Compare, Recommend), or ask custom follow-up questions in an interactive chat environment.

---

## ✨ Features / المزايا الرئيسية

- **📂 Multi-Format Sandbox Support**: Specifically restricted to accept `.pdf` and `.docx` formats up to **10MB** per file.
- **⚡ Smart Action Chips**: 
  - **Summarize**: Condense key findings, operational milestones, and bottleneck points.
  - **Compare**: Run a cross-document metrics variance analysis in structured tables.
  - **Recommend**: Issue actionable short-term, medium-term, and long-term roadmap suggestions.
- **🌐 Bilingual UI (AR/EN)**: Full Support for English (LTR) and Arabic (RTL) layout switching on the fly.
- **🌗 Dark / Light Mode**: Beautiful custom tailwind theme adapting seamlessly to lighting preferences.
- **📱 Ultra-Responsive Design**: Tailored drawer layouts for mobile and comfortable margins (`max-w-6xl`) on desktop.
- **⚡ Clean Modular Architecture**: Segmented cleanly into reusable components and state-managing hooks.

---

## 🛠️ Technology Stack / الأدوات والتقنيات

- **Core Framework**: React (Vite + TypeScript)
- **Styling**: Tailwind CSS v4 (Harmonious custom `raspberry-plum` HSL colors, Outfit/Oxanium typography)
- **Icons**: Lucide React
- **Package Manager**: npm

---

## 📁 Repository Structure / هيكل المشروع

```bash
AIRA/
├── apps/
│   └── web/
│       └── AIRA/                   # Main React Web Application
│           ├── src/
│           │   ├── components/     # Reusable components (Header, Sidebar, ChatWorkspace, PromptBar)
│           │   ├── constants/      # Localization translations (translations.ts)
│           │   ├── hooks/          # Custom Hooks (useFileWorkspace, useAIEngine)
│           │   ├── App.tsx         # Root orchestrator component
│           │   ├── index.css       # Tailwind directives & theme configuration
│           │   └── main.tsx
│           ├── index.html
│           ├── vite.config.ts
│           └── package.json
└── README.md                       # Repository documentation (this file)
```

---

## 🚀 Getting Started / طريقة التشغيل والاستخدام

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd apps/web/AIRA
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running Development Server
Launch the local Vite server:
```bash
npm run dev
```
Open `http://localhost:5173/` in your web browser.

### Building for Production
To build the optimized static assets:
```bash
npm run build
```

---

## 💡 How to Use / طريقة الاستخدام

1. **Upload Files**: Use the **File Workspace** on the right side. Drag & drop or click to upload `.pdf` or `.docx` files under 10MB.
2. **Execute Queries**: Click on any of the smart suggestion chips (e.g. *Summarize the documents*) to run a quick analysis.
3. **Ask Custom Questions**: Type your query in the prompt bar at the bottom and click send.
4. **Switch Languages/Themes**: Use the top-right header toggles to switch between English/Arabic layouts and Dark/Light modes.
5. **Clear & Start Over**: Click on the **AIRA** logo at the top-left to clear the workspace and return to the main dashboard.
