# AIRA — AI Research Assistant 🚀

**AIRA** is a chat-first, responsive AI Research Assistant designed to analyze documents, surface critical evidence, run metrics comparison, and help users make faster, data-driven decisions within a secured data sandbox.

---

## 🗺️ Overview / نظرة عامة
AIRA serves as a bridge between static multi-format documents and actionable executive intelligence. Users can upload their documents directly into a isolated workspace session, trigger quick analytical queries (Summarize, Compare, Recommend), or ask custom follow-up questions in an interactive chat environment powered by a multi-agent RAG pipeline.

---

## ✨ Features / المزايا الرئيسية

- **📂 Multi-Format Sandbox Support**: Specifically restricted to accept `.pdf` and `.docx` formats.
- **🛡️ Strict Security & Size Limits**:
  - Max **10MB** size limit per file.
  - Max **10MB** cumulative limit for the entire session (strictly enforced on both client-side and server-side).
- **🔒 Session-Based Isolation**: Automatically issues a unique `sessionId` stored in SessionStorage, ensuring files, index database, and chat sessions are fully isolated and secure.
- **📄 Interactive PDF Viewer**: Live document rendering! Next to the file count and list, users can click **"عرض الملف" / "View File"** to render PDFs natively in a responsive modal via `iframe`, with DOCX falling back to raw text.
- **⚡ Smart Action Chips**: 
  - **Summarize**: Condense key findings, operational milestones, and bottleneck points.
  - **Compare**: Run a cross-document metrics variance analysis in structured tables.
  - **Recommend**: Issue actionable short-term, medium-term, and long-term roadmap suggestions.
- **💬 Smart Conversational Logic**:
  - When no documents are uploaded, the assistant restricts responses. It only answers questions about its identity (introducing itself as AIRA); otherwise, it replies: *"لا يوجد مصدر لأعطيك منه معلومة."* / *"No source available to provide information."*.
- **🌐 Bilingual UI (AR/EN)**: Full Support for English (LTR) and Arabic (RTL) layout switching on the fly.
- **✍️ Premium Arabic Typography**: Integrated with **Noto Kufi Arabic** font applied globally across all elements in Arabic mode for an optimal RTL reading experience.
- **🌗 Dark / Light Mode**: Beautiful custom tailwind theme adapting seamlessly to lighting preferences.
- **📱 Ultra-Responsive Design**: Drawer layouts for mobile and comfortable margins (`max-w-6xl`) on desktop.

---

## 🛠️ Technology Stack / الأدوات والتقنيات

### Frontend (Client)
- **Core**: React (Vite + TypeScript)
- **Styling**: Tailwind CSS v4 (Harmonious custom `raspberry-plum` HSL colors, Outfit/Oxanium typography)
- **Icons**: Lucide React
- **Arabic Typography**: Noto Kufi Arabic

### Backend (Server)
- **Core**: FastAPI (Python)
- **RAG & Agents**:
  - **Ingestion Agent**: Plain text extractor using `pypdf` (for PDF) and `python-docx` (for DOCX).
  - **Retrieval Agent**: Semantic vector similarity searcher using Google Gemini Embeddings (`text-embedding-004`).
  - **Analysis Agent**: Context structuring optimizer.
  - **Decision Writer Agent**: Multi-turn SSE response streamer powered by Google Gemini models.
- **Database**: InMemory Database with session isolation, tracking document metadata, vectors, chunks, and raw files.

---

## 📁 Repository Structure / هيكل المشروع

```bash
AIRA/
├── apps/
│   ├── api/                        # FastAPI Backend Application
│   │   ├── src/
│   │   │   ├── agents/             # Multi-Agent workflows (Ingestion, Retrieval, Analysis, Decision Writer)
│   │   │   ├── services/           # Database layer (InMemoryDatabase) & Gemini client
│   │   │   └── config.py
│   │   ├── main.py                 # Backend Entrypoint (CORS, file serve/view/upload APIs)
│   │   └── requirements.txt
│   └── web/
│       └── AIRA/                   # React Vite Frontend Application
│           ├── src/
│           │   ├── components/     # Reusable UI (Header, Sidebar, ChatWorkspace, PromptBar)
│           │   ├── constants/      # Localization translations (translations.ts)
│           │   ├── hooks/          # Hooks (useFileWorkspace, useAIEngine)
│           │   ├── App.tsx         # Orchestrator
│           │   ├── index.css       # Tailwind directives & global font definitions
│           │   └── main.tsx
│           ├── index.html
│           ├── vite.config.ts
│           └── package.json
└── README.md                       # Documentation (this file)
```

---

## 🚀 Getting Started / طريقة التشغيل والاستخدام

### 1. Run the Backend API
1. Navigate to the API folder:
   ```bash
   cd apps/api
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set your environment variables (e.g. `GEMINI_API_KEY`).
4. Start the Uvicorn server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend API will run on `http://127.0.0.1:8000`.

### 2. Run the Frontend App
1. Navigate to the Frontend workspace:
   ```bash
   cd apps/web/AIRA
   ```
2. Install the packages:
   ```bash
   npm install
   ```
3. Launch the Vite dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your web browser.

---

## 💡 How to Use / طريقة الاستخدام

1. **Upload Files**: Drag & drop or browse `.pdf` or `.docx` files under 10MB in the sidebar.
2. **View Files**: Click the **"عرض الملف" / "View File"** button to view any document's PDF visual render or text inside the live preview modal.
3. **Ask Custom Questions**: Use the prompt bar. Note that if no files are uploaded, AIRA will only answer questions about who it is, and direct other requests to the source warning message.
4. **Action Chips**: Utilize the Summarize/Compare/Recommend chips for instant automated workflows.
5. **Clear Chat**: Click on the **AIRA** logo at the top-left to clear the workspace session.
