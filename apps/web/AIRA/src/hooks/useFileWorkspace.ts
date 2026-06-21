import { useState, useRef } from 'react'

export interface AppFile {
  id: string
  name: string
  size: string
  type: string
  status: 'uploading' | 'completed' | 'error'
  progress: number
}

export function useFileWorkspace(t: any) {
  const [files, setFiles] = useState<AppFile[]>([
    { id: '1', name: 'Market_Analysis_2026.pdf', size: '2.4 MB', type: 'pdf', status: 'completed', progress: 100 },
    { id: '2', name: 'Project_Milestones.docx', size: '1.2 MB', type: 'docx', status: 'completed', progress: 100 }
  ])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const addFiles = (selectedFiles: File[]) => {
    const validFiles: File[] = []

    for (const file of selectedFiles) {
      const extension = file.name.split('.').pop()?.toLowerCase() || ''
      if (extension !== 'pdf' && extension !== 'docx') {
        alert(`${file.name}: ${t.fileTypeError}`)
        continue
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name}: ${t.fileSizeError}`)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    const newFiles = validFiles.map((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'pdf'
      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`

      const newFile: AppFile = {
        id: Math.random().toString(36).substring(2, 11),
        name: file.name,
        size: formattedSize,
        type: extension,
        status: 'uploading',
        progress: 10
      }

      let prog = 10
      const interval = setInterval(() => {
        prog += 30
        if (prog >= 100) {
          prog = 100
          clearInterval(interval)
          setFiles((prev) =>
            prev.map((f) => (f.id === newFile.id ? { ...f, status: 'completed', progress: 100 } : f))
          )
        } else {
          setFiles((prev) =>
            prev.map((f) => (f.id === newFile.id ? { ...f, progress: prog } : f))
          )
        }
      }, 300)

      return newFile
    })

    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  return {
    files,
    isDragging,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    removeFile
  }
}
export type UseFileWorkspaceReturn = ReturnType<typeof useFileWorkspace>
