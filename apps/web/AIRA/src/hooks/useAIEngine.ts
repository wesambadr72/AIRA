import { useState } from 'react'
import type { AppFile } from './useFileWorkspace'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  actionType?: 'summarize' | 'compare' | 'recommend' | 'normal'
  suggestedAction?: string
}

const isSelfIntro = (q: string): boolean => {
  const clean = q.toLowerCase().trim()
  return (
    clean.includes('who are you') ||
    clean.includes('who are u') ||
    clean.includes('what is your name') ||
    clean.includes("what's your name") ||
    clean.includes('introduce yourself') ||
    clean.includes('who is aira') ||
    clean.includes('what is aira') ||
    clean.includes('من أنت') ||
    clean.includes('من انت') ||
    clean.includes('ما اسمك') ||
    clean.includes('ما الاسم') ||
    clean.includes('عرف عن نفسك') ||
    clean.includes('أنت مين') ||
    clean.includes('انت مين') ||
    clean.includes('من هي أيرا') ||
    clean.includes('من هي aira')
  )
}

export function useAIEngine(
  files: AppFile[],
  lang: 'en' | 'ar',
  t: any
) {
  const [query, setQuery] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  const runSimulatedAnalysis = async (userQuery: string, type: 'summarize' | 'compare' | 'recommend' | 'normal') => {
    setQuery('') // Clear the query input field immediately

    if (files.length === 0 && !isSelfIntro(userQuery)) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'user',
          content: userQuery,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: Math.random().toString(),
          role: 'assistant',
          content: t.noSourceWarning,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionType: 'normal'
        }
      ])
      return
    }

    setIsAnalyzing(true)
    setQuery('')
    setAnalysisStep(lang === 'en' ? '🔍 Initializing agent coordination...' : '🔍 تهيئة تنسيق الوكلاء...')

    // Add user message
    setChatMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        role: 'user',
        content: userQuery,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])

    const assistantMessageId = Math.random().toString()

    try {
      const sessionId = sessionStorage.getItem('aira_session_id') || ''
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: userQuery,
          fileIds: files.map((f) => f.id),
          history: chatMessages.map((m) => ({ role: m.role, content: m.content })),
          actionType: type,
          lang: lang,
          sessionId: sessionId
        })
      })

      if (!response.ok) {
        if (response.status === 429) {
          try {
            const errData = await response.json()
            throw new Error(errData.detail)
          } catch {
            throw new Error(lang === 'ar' ? 'تجاوزت حد الرسائل المسموح به. يرجى الانتظار دقيقة.' : 'Rate limit exceeded. Please wait a minute.')
          }
        }
        throw new Error('Failed to communicate with multi-agent system backend.')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No readable response body received from server.')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let isDone = false
      let streamEnded = false
      const tokenQueue: string[] = []
      let displayedText = ''
      let typingTimer: any = null

      const startTypingLoop = () => {
        if (typingTimer) return
        typingTimer = setInterval(() => {
          if (tokenQueue.length === 0) {
            if (streamEnded) {
              clearInterval(typingTimer)
              typingTimer = null
            }
            return
          }

          // Dynamic speed batching: pop more characters if queue is large to prevent lag
          const batchSize = tokenQueue.length > 40 ? 4 : (tokenQueue.length > 15 ? 2 : 1)
          const nextChars = tokenQueue.splice(0, batchSize).join('')
          displayedText += nextChars

          setChatMessages((prev) => {
            const exists = prev.some((m) => m.id === assistantMessageId)
            if (!exists) {
              return [
                ...prev,
                {
                  id: assistantMessageId,
                  role: 'assistant',
                  content: displayedText,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  actionType: type
                }
              ]
            } else {
              return prev.map((m) =>
                m.id === assistantMessageId ? { ...m, content: displayedText } : m
              )
            }
          })
        }, 15) // Smooth 15ms update interval
      }

      while (!isDone) {
        const { done, value } = await reader.read()
        if (done) {
          isDone = true
          streamEnded = true
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || '' 

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace(/^data:\s*/, '').trim()
            if (!dataStr) continue

            try {
              const event = JSON.parse(dataStr)

              if (event.type === 'status') {
                setAnalysisStep(event.message)
              } else if (event.type === 'token') {
                setIsAnalyzing(false)
                // Queue characters and run typing effect
                tokenQueue.push(...event.content.split(''))
                startTypingLoop()
              } else if (event.type === 'error') {
                streamEnded = true
                throw new Error(event.message)
              } else if (event.type === 'done') {
                isDone = true
                streamEnded = true
              }
            } catch (e) {
              console.error('Failed to parse SSE JSON payload:', e, line)
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Chat execution error:', err)
      setIsAnalyzing(false)
      
      const errorMessage = lang === 'en'
        ? `⚠️ **Service Error:** ${err.message || 'Unable to fetch response from AIRA backend. Check if FastAPI server is running.'}`
        : `⚠️ **خطأ في الخدمة:** ${err.message || 'تعذر جلب الاستجابة من خادم AIRA. يرجى التحقق من تشغيل خادم FastAPI.'}`

      setChatMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionType: 'normal'
        }
      ])
    }
  }

  const resetChat = () => {
    setChatMessages([])
    setQuery('')
  }

  return {
    query,
    setQuery,
    isAnalyzing,
    analysisStep,
    chatMessages,
    runSimulatedAnalysis,
    resetChat
  }
}
export type UseAIEngineReturn = ReturnType<typeof useAIEngine>

