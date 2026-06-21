import { Plus, Send, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react'

interface PromptBarProps {
  query: string
  setQuery: React.Dispatch<React.SetStateAction<string>>
  isAnalyzing: boolean
  runSimulatedAnalysis: (userQuery: string, type: 'summarize' | 'compare' | 'recommend' | 'normal') => Promise<void>
  fileInputRef: React.RefObject<HTMLInputElement | null>
  isDarkMode: boolean
  t: any
}

export default function PromptBar({
  query,
  setQuery,
  isAnalyzing,
  runSimulatedAnalysis,
  fileInputRef,
  isDarkMode,
  t
}: PromptBarProps) {
  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    runSimulatedAnalysis(query, 'normal')
  }

  const triggerChipAction = (chipText: string, type: 'summarize' | 'compare' | 'recommend') => {
    runSimulatedAnalysis(chipText, type)
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleQuerySubmit} className="relative group">
        <div className="absolute -inset-0.5 bg-linear-to-r from-brand-logo to-raspberry-plum-400 rounded-full blur opacity-20 group-focus-within:opacity-60 transition-all duration-300"></div>
        
        <div className={`relative flex items-center border rounded-full pl-5 pr-2.5 py-2.5 transition-all duration-300 ${
          isDarkMode ? 'bg-brand-bg border-raspberry-plum-800/40' : 'bg-white border-raspberry-plum-200'
        }`}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.placeholder}
            className="bg-transparent border-none outline-none grow text-sm sm:text-base mr-3 text-inherit placeholder-raspberry-plum-300/60"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full text-raspberry-plum-400 hover:text-brand-logo dark:hover:text-raspberry-plum-100 transition-all mr-1"
            title="Upload additional files"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={!query.trim() || isAnalyzing}
            className="bg-brand-logo hover:bg-brand-logo/95 disabled:bg-raspberry-plum-900/20 disabled:text-raspberry-plum-800 text-brand-text p-2.5 rounded-full transition-all flex items-center justify-center hover:scale-105 active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Smart Action chips */}
      <div className="flex flex-row flex-nowrap md:flex-wrap gap-2.5 justify-start overflow-x-auto pb-1.5 scrollbar-none max-w-full">
        <button
          type="button"
          onClick={() => triggerChipAction('Summarize the documents', 'summarize')}
          className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-brand-logo/5 flex items-center gap-1.5 border shrink-0 ${
            isDarkMode
              ? 'text-raspberry-plum-200 bg-raspberry-plum-950/20 border-raspberry-plum-800/30 hover:border-brand-logo/60 hover:bg-raspberry-plum-950/50'
              : 'text-brand-logo bg-white border-raspberry-plum-200 hover:border-brand-logo hover:bg-raspberry-plum-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-logo" />
          {t.chipSummarize}
        </button>

        <button
          type="button"
          onClick={() => triggerChipAction('Compare the documents', 'compare')}
          className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-brand-logo/5 flex items-center gap-1.5 border shrink-0 ${
            isDarkMode
              ? 'text-raspberry-plum-200 bg-raspberry-plum-950/20 border-raspberry-plum-800/30 hover:border-brand-logo/60 hover:bg-raspberry-plum-950/50'
              : 'text-brand-logo bg-white border-raspberry-plum-200 hover:border-brand-logo hover:bg-raspberry-plum-50'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-brand-logo" />
          {t.chipCompare}
        </button>

        <button
          type="button"
          onClick={() => triggerChipAction('Give Final Recommendation', 'recommend')}
          className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-brand-logo/5 flex items-center gap-1.5 border shrink-0 ${
            isDarkMode
              ? 'text-raspberry-plum-200 bg-raspberry-plum-950/20 border-raspberry-plum-800/30 hover:border-brand-logo/60 hover:bg-raspberry-plum-950/50'
              : 'text-brand-logo bg-white border-raspberry-plum-200 hover:border-brand-logo hover:bg-raspberry-plum-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-logo" />
          {t.chipRecommend}
        </button>
      </div>
    </div>
  )
}
