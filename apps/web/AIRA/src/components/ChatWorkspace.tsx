import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import type { ChatMessage } from '../hooks/useAIEngine'
import { Logo } from './Header'

interface ChatWorkspaceProps {
  chatMessages: ChatMessage[]
  isAnalyzing: boolean
  analysisStep: string
  isDarkMode: boolean
  t: any
  chatEndRef: React.RefObject<HTMLDivElement | null>
}

export default function ChatWorkspace({
  chatMessages,
  isAnalyzing,
  analysisStep,
  isDarkMode,
  t,
  chatEndRef
}: ChatWorkspaceProps) {
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isAnalyzing])
  const parseInlineMarkdown = (text: string) => {
    const regex = /(\*\*.*?\*\*|`.*?`)/g
    const parts = text.split(regex)
    
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-brand-logo dark:text-raspberry-plum-400">
            {part.slice(2, -2)}
          </strong>
        )
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="font-mono text-xs px-1.5 py-0.5 rounded border dark:bg-raspberry-plum-950/10 dark:text-raspberry-plum-400 dark:border-raspberry-plum-800/20 bg-[#FFE5F5] text-brand-logo border-raspberry-plum-200">
            {part.slice(1, -1)}
          </code>
        )
      }
      return part
    })
  }

  const renderMessageContent = (content: string) => {
    const lines = content.split('\n')
    return (
      <div className="space-y-2.5">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base sm:text-lg font-bold text-brand-logo dark:text-raspberry-plum-400 mt-3 mb-1.5 font-oxanium">
                {parseInlineMarkdown(line.slice(4))}
              </h3>
            )
          }

          if (line.startsWith('* ') || line.startsWith('- ')) {
            return (
              <li key={idx} className="ms-5 list-disc text-sm sm:text-base leading-relaxed text-inherit">
                {parseInlineMarkdown(line.slice(2))}
              </li>
            )
          }

          const numListMatch = line.match(/^(\d+)\.\s+(.*)/)
          if (numListMatch) {
            const num = numListMatch[1]
            const rest = numListMatch[2]
            return (
              <div key={idx} className="flex gap-2 ms-4 my-1 text-sm sm:text-base align-top text-inherit">
                <span className="font-bold text-brand-logo dark:text-brand-logo shrink-0">{num}.</span>
                <span className="leading-relaxed">{parseInlineMarkdown(rest)}</span>
              </div>
            )
          }

          if (line.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-s-2 border-brand-logo dark:border-brand-logo ps-3 py-1 my-2 bg-raspberry-plum-950/10 dark:bg-raspberry-plum-950/10 text-brand-logo dark:text-brand-logo rounded-e-md text-md">
                {parseInlineMarkdown(line.slice(2))}
              </blockquote>
            )
          }

          if (line.startsWith('|')) {
            if (line.includes('---')) return null
            const cells = line.split('|').filter((c) => c.trim() !== '')
            const isHeader = line.includes('Metrics') || line.includes('Variance') || line.includes('المقاييس')
            return (
              <div
                key={idx}
                className={`grid grid-cols-4 gap-2 py-1.5 border-b border-raspberry-plum-950/10 dark:border-raspberry-plum-950/20 text-xs sm:text-sm ${
                  isHeader ? 'font-bold text-brand-logo dark:text-raspberry-plum-300' : 'text-inherit'
                }`}
              >
                {cells.map((cell, cIdx) => (
                  <span key={cIdx} className="truncate">
                    {parseInlineMarkdown(cell.trim())}
                  </span>
                ))}
              </div>
            )
          }

          if (!line.trim()) return null
          return (
            <p key={idx} className="text-sm sm:text-base leading-relaxed text-inherit">
              {parseInlineMarkdown(line)}
            </p>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-h-[72vh] overflow-y-auto pr-2 mb-6 scrollbar-thin scrollbar-thumb-raspberry-plum-500/20">
      {chatMessages.map((msg) => (
        <div
          key={msg.id}
          className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`flex flex-col space-y-2 p-5 rounded-2xl border transition-all max-w-[85%] sm:max-w-[75%] ${
              msg.role === 'user'
                ? (isDarkMode 
                    ? 'bg-raspberry-plum-950/30 border-raspberry-plum-900/10 text-end items-end rounded-se-none' 
                    : 'bg-raspberry-plum-50/40 border-raspberry-plum-100 text-end items-end rounded-se-none')
                : (isDarkMode 
                    ? 'bg-raspberry-plum-950/20 border-raspberry-plum-800/20 text-start items-start rounded-ss-none' 
                    : 'bg-white border-raspberry-plum-200 text-start items-start rounded-ss-none')
            }`}
          >
            <div className="flex items-center gap-2 text-xs text-raspberry-plum-400 font-semibold">
              {msg.role === 'user' ? (
                <span>{t.you}</span>
              ) : (
                <span className="flex items-center gap-1">
                  <Logo className="w-3.5 h-3.5" /> {t.airaIntelligence}
                </span>
              )}
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div className="text-inherit text-sm sm:text-base leading-relaxed wrap-break-word text-start w-full">
              {renderMessageContent(msg.content)}
            </div>
          </div>
        </div>
      ))}

      {isAnalyzing && (
        <div className="flex w-full justify-start">
          <div className="flex flex-col space-y-3 p-5 rounded-2xl bg-white dark:bg-brand-logo/5 border border-raspberry-plum-200/60 dark:border-brand-logo/20 text-start animate-pulse max-w-[85%] sm:max-w-[75%] rounded-ss-none w-full shadow-sm">
            <div className="flex items-center gap-2 text-xs text-raspberry-plum-700 dark:text-raspberry-plum-500 font-bold">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-logo dark:text-raspberry-plum-400" />
              <span>{t.analyzing}</span>
            </div>
            <span className="text-sm text-slate-800 dark:text-raspberry-plum-600 font-bold">
              {analysisStep}
            </span>
            <div className="space-y-2 mt-1">
              <div className="h-2 bg-slate-200/80 dark:bg-raspberry-plum-400/20 rounded w-5/6"></div>
              <div className="h-2 bg-slate-200/80 dark:bg-raspberry-plum-400/20 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={chatEndRef as any} />
    </div>
  )
}
