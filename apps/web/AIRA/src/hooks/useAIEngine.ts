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
    if (files.length === 0) {
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
          content: t.noDocsWarning,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionType: 'normal'
        }
      ])
      return
    }

    setIsAnalyzing(true)
    setQuery('')

    setChatMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        role: 'user',
        content: userQuery,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])

    const steps = lang === 'en' ? [
      '🔍 Reading uploaded documents...',
      '⚙️ Parsing structural data & tables...',
      '🧠 Processing queries through AIRA Neural Engine...',
      '✍️ Drafting output response...'
    ] : [
      '🔍 قراءة المستندات المرفوعة...',
      '⚙️ تحليل الجداول والبيانات الهيكلية...',
      '🧠 معالجة الاستعلامات عبر محرك AIRA العصبي...',
      '✍️ كتابة مسودة استجابة المخرجات...'
    ]

    for (const step of steps) {
      setAnalysisStep(step)
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    setIsAnalyzing(false)

    let assistantReply = ''
    let actionLabel: 'summarize' | 'compare' | 'recommend' | 'normal' = 'normal'

    if (type === 'summarize') {
      actionLabel = 'summarize'
      assistantReply = lang === 'en' 
        ? `### 📋 Document Analysis Summary
Here is the condensed executive summary of your uploaded files (**${files.map(f => f.name).join(', ')}**):

1. **Market Landscape & Capital Activity**: 
   The \`Market_Analysis_2026.pdf\` highlights a strong shift towards agentic system platforms in Q1 2026, recording a **45% increase** in capital allocation compared to Q4 2025.
2. **Operational Milestones**:
   Cross-referencing \`Project_Milestones.csv\`, the project milestones track a consistent delivery velocity, with the core LLM pipelines completed **2 weeks ahead of schedule**.
3. **Identified Bottlenecks**:
   Deployment latency in secondary staging environments is currently lagging by **12%** due to integration overhead.

> **💡 Key Decision Point:** To scale successfully by Q3, focus resources on optimizing API layer response times and consolidating staging frameworks.`
        : `### 📋 ملخص تحليل المستندات
هذا هو الملخص التنفيذي المكثف لملفاتك المرفوعة (**${files.map(f => f.name).join(', ')}**):

1. **مشهد السوق والنشاط الاستثماري**: 
   يوضح ملف \`Market_Analysis_2026.pdf\` تحولاً قوياً نحو منصات الأنظمة الوكيلة في الربع الأول من عام 2026، حيث سجل **زيادة بنسبة 45%** في رأس المال المخصص مقارنة بالربع الرابع من عام 2025.
2. **المعالم التشغيلية للمشروع**:
   بالإشارة إلى ملف \`Project_Milestones.csv\`، تتبع معالم المشروع سرعة تسليم ثابتة، مع اكتمال خطوط أنابيب نماذج اللغة الكبيرة الأساسية **قبل الموعد المحدد بأسبوعين**.
3. **الاختناقات المحددة**:
   يتأخر زمن انتقال النشر في البيئات المؤقتة الثانوية حالياً بنسبة **12%** بسبب أعباء التكامل البرمجية.

> **💡 نقطة القرار الرئيسية:** لتحقيق التوسع بنجاح بحلول الربع الثالث، ركز الموارد على تحسين أوقات استجابة طبقة واجهة برمجة التطبيقات ودمج أطر عمل النشر المؤقتة.`
    } else if (type === 'compare') {
      actionLabel = 'compare'
      assistantReply = lang === 'en'
        ? `### 📊 Cross-Document Comparison

I have cross-compared the operational velocity with market standards. Here is the analysis:

| Metrics / Parameters | Market Standard (2026) | AIRA Project (Current) | Variance |
| :--- | :--- | :--- | :--- |
| **Development Velocity** | 12 weeks / release | 9 weeks / release | **+25% Faster** 🟢 |
| **Pipeline Latency** | < 280ms average | 320ms average | **-14% Latency** 🔴 |
| **Resource Efficiency** | 76% average utilization | 88% average utilization | **+12% Optimal** 🟢 |

**Key Findings:**
- Your current speed is superior, but API throughput constraints represent the single critical risk in scaling this architecture.`
        : `### 📊 مقارنة المستندات المتقاطعة

لقد قمت بمقارنة السرعة التشغيلية بمعايير السوق الحالية. إليك نتائج التحليل:

| المقاييس / المعايير | معيار السوق (2026) | مشروع AIRA (الحالي) | التباين |
| :--- | :--- | :--- | :--- |
| **سرعة التطوير** | 12 أسبوعاً / إصدار | 9 أسابيع / إصدار | **+25% أسرع** 🟢 |
| **زمن استجابة الخط** | < 280ms في المتوسط | 320ms في المتوسط | **-14% تأخير** 🔴 |
| **كفاءة الموارد** | 76% متوسط الاستغلال | 88% متوسط الاستغلال | **+12% أمثل** 🟢 |

**النتائج الرئيسية:**
- سرعتك الحالية ممتازة ومتفوقة، لكن قيود إنتاجية واجهة برمجة التطبيقات تمثل خطراً حرجاً فردياً في توسيع هذه البنية.`
    } else if (type === 'recommend') {
      actionLabel = 'recommend'
      assistantReply = lang === 'en'
        ? `### 🚀 Actionable Recommendations for AIRA

Based on the uploaded files, I recommend the following execution plan:

* **Short-Term (1-2 Weeks):** 
  Optimize the backend indexing query pipeline to reduce the 320ms latency down to the 280ms threshold.
* **Medium-Term (1 Month):**
  Automate the report creation by establishing an automated continuous ingestion pipeline for new CSV logs.
* **Long-Term (Q3 2026):**
  Reallocate 15% of pipeline engineers to the deployment scaling stack to mitigate staging overhead risks.

**Confidence Score:** **96%** (based on data completeness across all uploaded files).`
        : `### 🚀 توصيات قابلة للتنفيذ لمشروع AIRA

استناداً إلى الملفات المرفوعة، أوصي بخطة التنفيذ التالية:

* **المدى القصير (1-2 أسبوع):** 
  تحسين خط أنابيب استعلام الفهرسة الخلفي لتقليل زمن انتقال 320ms إلى حد 280ms المقبول.
* **المدى المتوسط (شهر واحد):**
  أتمتة عملية إنشاء التقارير عن طريق إنشاء خط أنابيب استيعاب مستمر ومؤتمت لسجلات CSV الجديدة.
* **المدى الطويل (الربع الثالث 2026):**
  إعادة تخصيص 15% من مهندسي خطوط الأنابيب إلى مجموعة تطوير النشر للتخفيف من مخاطر أعباء البيئة المؤقتة.

**مستوى الثقة:** **96%** (بناءً على اكتمال البيانات عبر جميع الملفات المرفوعة).`
    } else {
      assistantReply = lang === 'en'
        ? `I've analyzed your custom query: *"${userQuery}"* across the uploaded documents.

Based on the context in **${files[0]?.name || 'your files'}**:
- The project tracks continuous enhancement metrics.
- All dependencies are successfully accounted for, and operations are running in stable environment configs.

Let me know if you would like me to compile a **Summary**, run a **Comparison**, or issue a **Final Recommendation** on these topics!`
        : `لقد قمت بتحليل استفسارك المخصص: *"${userQuery}"* عبر المستندات المرفوعة.

استناداً إلى سياق ملف **${files[0]?.name || 'ملفاتك المرفوعة'}**:
- يتتبع المشروع مقاييس التحسين المستمرة.
- تم حساب جميع التبعيات بنجاح، وتعمل العمليات في تكوينات بيئية مستقرة.

أخبرني إذا كنت ترغب في أن أقوم بجمع **ملخص**، أو إجراء **مقارنة**، أو تقديم **توصية نهائية** بشأن هذه المواضيع!`
    }

    setChatMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        role: 'assistant',
        content: assistantReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType: actionLabel
      }
    ])
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
