import { useState, useEffect } from 'react'
import { Upload, FileText, Trash2, FileSpreadsheet, FileCode, X, Eye } from 'lucide-react'
import type { AppFile } from '../hooks/useFileWorkspace'

interface SidebarProps {
  files: AppFile[]
  isDragging: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: () => void
  handleDrop: (e: React.DragEvent) => void
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeFile: (id: string) => void
  isDarkMode: boolean
  lang: 'en' | 'ar'
  t: any
  isSidebarOpen: boolean
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  sessionId: string
}

export default function Sidebar({
  files,
  isDragging,
  fileInputRef,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileSelect,
  removeFile,
  isDarkMode,
  lang,
  t,
  isSidebarOpen,
  setIsSidebarOpen,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sessionId,
}: SidebarProps) {
  const [viewFile, setViewFile] = useState<AppFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);

  useEffect(() => {
    if (!viewFile) {
      setFileContent('');
      return;
    }
    setIsLoadingContent(true);
    fetch(`/api/files/${viewFile.id}/content?sessionId=${sessionId}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setFileContent(data.content || '');
      })
      .catch(() => {
        setFileContent(t.fileLoadError || (lang === 'ar' ? 'فشل في تحميل محتوى الملف.' : 'Failed to load file content.'));
      })
      .finally(() => {
        setIsLoadingContent(false);
      });
  }, [viewFile, sessionId, lang, t.fileLoadError]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'csv':
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
      case 'json':
      case 'js':
      case 'ts':
      case 'tsx':
        return <FileCode className="w-5 h-5 text-blue-400" />
      default:
        return <FileText className="w-5 h-5 text-brand-logo" />
    }
  }

  const sidebarContent = (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-logo" /> {t.workspaceTitle}
        </h2>
        <div className="flex items-center gap-2">
          {files.length > 0 && (
            <button
              onClick={() => {
                setViewFile(files[0]);
              }}
              className="text-xs font-semibold px-2 py-0.5 rounded border bg-brand-logo/10 border-brand-logo/30 text-brand-logo hover:bg-brand-logo/25 transition-all cursor-pointer"
            >
              {t.viewFile || 'عرض الملف'}
            </button>
          )}
          <span className={`text-xs px-2 py-0.5 rounded font-semibold border ${
            isDarkMode 
              ? 'bg-raspberry-plum-950/40 text-raspberry-plum-300 border-raspberry-plum-900/30' 
              : 'bg-white text-brand-logo border-raspberry-plum-200'
          }`}>
            {files.length} {t.filesCount}
          </span>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-brand-logo bg-raspberry-plum-950/20 scale-102'
            : (isDarkMode 
                ? 'border-raspberry-plum-800/30 hover:border-brand-logo/60 bg-brand-bg/50 hover:bg-brand-bg/90' 
                : 'border-raspberry-plum-200 hover:border-brand-logo/60 bg-white hover:bg-white/80')
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-raspberry-plum-950/20 rounded-lg text-raspberry-plum-500">
            <Upload className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">
              {t.dragBoxTitle}
            </p>
            <p className="text-xs text-raspberry-plum-400 dark:text-raspberry-plum-300">
              {t.dragBoxDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="grow space-y-3 overflow-y-auto max-h-[350px] md:max-h-none pr-1">
        <span className="block text-xs font-semibold text-raspberry-plum-400 uppercase tracking-wider">
          {t.uploadedFilesHeader}
        </span>
        
        {files.length === 0 ? (
          <div className={`text-center py-8 text-xs rounded-xl border ${
            isDarkMode 
              ? 'text-raspberry-plum-200/30 border-raspberry-plum-950/20 bg-raspberry-plum-950/5' 
              : 'text-slate-400 border-raspberry-plum-100 bg-white/50'
          }`}>
            {t.emptyWorkspace}
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={`group/file relative flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-brand-bg/70 border-raspberry-plum-950/30 hover:border-raspberry-plum-800/40 hover:bg-brand-bg'
                    : 'bg-white border-raspberry-plum-200/80 hover:border-brand-logo/40 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-6">
                  <div className="p-2 bg-raspberry-plum-950/30 dark:bg-raspberry-plum-950/40 rounded-md shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0 text-start">
                    <p className="text-xs sm:text-sm font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-raspberry-plum-400 dark:text-raspberry-plum-300">
                      {file.size}
                    </p>
                    {file.status === 'uploading' && (
                      <div className="w-24 bg-raspberry-plum-950/80 rounded-full h-1 mt-1 overflow-hidden">
                        <div
                          className="bg-brand-logo h-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(file.id)
                  }}
                  className={`p-1 rounded transition-all opacity-0 group-hover/file:opacity-100 absolute ${
                    lang === 'ar' ? 'left-2' : 'right-2'
                  } ${
                    isDarkMode ? 'text-raspberry-plum-400 hover:text-red-400 hover:bg-raspberry-plum-900/10' : 'text-slate-400 hover:text-red-600 hover:bg-raspberry-plum-50'
                  }`}
                  title={t.removeFile}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setViewFile(file)
                  }}
                  className={`p-1 rounded transition-all opacity-0 group-hover/file:opacity-100 absolute ${
                    lang === 'ar' ? 'right-2' : 'left-2'
                  } ${
                    isDarkMode ? 'text-raspberry-plum-400 hover:text-blue-400 hover:bg-raspberry-plum-900/10' : 'text-slate-400 hover:text-blue-600 hover:bg-raspberry-plum-50'
                  }`}
                  title={t.viewFile || 'View'}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`hidden md:flex w-80 border-l flex-col justify-between shrink-0 transition-all ${
          isDarkMode 
            ? 'bg-[#11171E] border-raspberry-plum-950/20' 
            : 'bg-[#FFF6FB] border-raspberry-plum-200'
        } ${isDragging ? (isDarkMode ? 'bg-raspberry-plum-950/10 border-brand-logo/50' : 'bg-raspberry-plum-50 border-brand-logo/50') : ''}`}
      >
        {sidebarContent}
        <div className="p-6 border-t border-raspberry-plum-950/20 text-center">
          <p className="text-[10px] text-raspberry-plum-400 dark:text-raspberry-plum-300">
            {t.footer}
          </p>
          <a className="text-[10px] text-raspberry-plum-400 dark:text-raspberry-plum-300 hover:underline hover:text-brand-logo transition-all" href="https://wesamlt.netlify.app/">{t.footerLink}</a>
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm"
          />

          <div className={`relative flex-1 flex flex-col max-w-xs w-full p-6 space-y-6 ${
            isDarkMode ? 'bg-[#11171E] border-r border-raspberry-plum-950/20' : 'bg-[#FFF6FB] border-r border-raspberry-plum-200'
          }`}>
            <div className="flex items-center justify-between px-6 pt-4 shrink-0">
              <h2 className="text-base font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-logo" /> {t.workspaceTitle}
              </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg text-raspberry-plum-400 hover:bg-raspberry-plum-900/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>

            <div className="text-center pt-4 border-t border-raspberry-plum-950/15 shrink-0">
              <p className="text-[10px] text-raspberry-plum-400 dark:text-raspberry-plum-300/40">
                {t.footer}
              </p>
              <a className="text-[10px] text-raspberry-plum-400 dark:text-raspberry-plum-300 hover:underline hover:text-brand-logo transition-all" href="https://wesamlt.netlify.app/">{t.footerLink}</a>
            </div>
          </div>
        </div>
      )}

      {/* Hidden input to upload */}
      <input
        type="file"
        ref={fileInputRef as any}
        onChange={handleFileSelect}
        multiple
        accept=".pdf,.docx"
        className="hidden"
      />
      {viewFile && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white dark:bg-[#11171E] border border-slate-200 dark:border-raspberry-plum-950/20 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-raspberry-plum-950/15">
              <h2 className="text-lg font-bold flex items-center gap-2 truncate">
                <FileText className="w-5 h-5 text-brand-logo" />
                <span className="truncate">{viewFile.name}</span>
              </h2>
              <button
                onClick={() => setViewFile(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-raspberry-plum-900/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-black/20">
              {viewFile.type === 'pdf' ? (
                <iframe
                  src={`/api/files/${viewFile.id}/view?sessionId=${sessionId}`}
                  className="w-full h-full border-none"
                  title={viewFile.name}
                />
              ) : (
                <div className="p-6 text-sm leading-relaxed text-slate-700 dark:text-raspberry-plum-100/90 whitespace-pre-wrap select-text overflow-y-auto h-full">
                  {isLoadingContent ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-logo"></div>
                      <p className="text-xs text-slate-400 dark:text-raspberry-plum-300">
                        {lang === 'ar' ? 'جاري تحميل محتوى الملف...' : 'Loading file content...'}
                      </p>
                    </div>
                  ) : (
                    fileContent || (lang === 'ar' ? 'الملف فارغ.' : 'File is empty.')
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-raspberry-plum-950/15 flex justify-end">
              <button
                className="px-4 py-2 bg-brand-logo hover:bg-brand-logo/90 text-white font-medium text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                onClick={() => setViewFile(null)}
              >
                {t.close || 'إغلاق'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
