import { useState, useRef } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatWorkspace from './components/ChatWorkspace'
import PromptBar from './components/PromptBar'
import { useFileWorkspace } from './hooks/useFileWorkspace'
import { useAIEngine } from './hooks/useAIEngine'
import { translations } from './constants/translations'
import { Analytics } from '@vercel/analytics/next';


function App() {
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const t = translations[lang]

  // Hook for files list & upload workspace state
  const workspace = useFileWorkspace(t)

  // Hook for AI processing state & chat messages log
  const ai = useAIEngine(workspace.files, lang, t)

  return (
    <>
      <Analytics />
      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className={`min-h-screen flex flex-col relative selection:bg-raspberry-plum-600/30 selection:text-raspberry-plum-100 transition-colors duration-300 ${
          isDarkMode ? 'bg-brand-bg text-brand-text' : 'bg-[#FFF0FA] text-brand-bg'
        }`}
      >

      {/* Header */}
      <Header
        lang={lang}
        setLang={setLang}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogoClick={ai.resetChat}
      />

      {/* Main Grid Wrapper */}
      <div className="flex-1 flex flex-col md:flex-row relative">

        {/* Central Workspace Area */}
        <main className="flex-1 flex flex-col p-6 md:p-10 justify-between max-w-6xl mx-auto w-full transition-all duration-300">
          
          <div className="my-auto py-8">
            {ai.chatMessages.length === 0 && !ai.isAnalyzing ? (
              /* Welcome Info Area */
              <div className="space-y-4 text-center md:text-start">
                <h1 className="font-oxanium text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
                  <span className="block text-brand-logo dark:text-raspberry-plum-300 font-light mb-2">{t.titlePrefix}</span>
                  <span className="block text-brand-logo dark:text-raspberry-plum-300 font-light">
                    {t.titleSuffix}
                    <span className="inline-block rounded-lg px-3 py-0.5 mx-2 bg-raspberry-plum-200/50 dark:bg-raspberry-plum-900/70 text-brand-logo dark:text-raspberry-plum-400 font-semibold shadow-sm italic">
                      {t.Aira}
                    </span>
                  </span>
                </h1>
                <p className={`text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto md:mx-0 ${
                  isDarkMode ? 'text-raspberry-plum-200/60' : 'text-slate-600'
                }`}>
                  {t.subtitle}
                </p>
              </div>
            ) : (
              /* Chat Message thread listing */
              <ChatWorkspace
                chatMessages={ai.chatMessages}
                isAnalyzing={ai.isAnalyzing}
                analysisStep={ai.analysisStep}
                isDarkMode={isDarkMode}
                t={t}
                chatEndRef={chatEndRef}
              />
            )}
          </div>

          {/* Prompt, Search Box and Options Area */}
          <PromptBar
            query={ai.query}
            setQuery={ai.setQuery}
            isAnalyzing={ai.isAnalyzing}
            runSimulatedAnalysis={ai.runSimulatedAnalysis}
            fileInputRef={workspace.fileInputRef}
            isDarkMode={isDarkMode}
            t={t}
          />
        </main>

        {/* Drag & Drop File Sidebar Panel */}
        <Sidebar
          files={workspace.files}
          isDragging={workspace.isDragging}
          fileInputRef={workspace.fileInputRef}
          handleDragOver={workspace.handleDragOver}
          handleDragLeave={workspace.handleDragLeave}
          handleDrop={workspace.handleDrop}
          handleFileSelect={workspace.handleFileSelect}
          removeFile={workspace.removeFile}
          isDarkMode={isDarkMode}
          lang={lang}
          t={t}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          sessionId={workspace.sessionId}
        />
      </div>

    </div>
    </>
  )
}

export default App
