import { useState, useRef, useEffect } from 'react'

export interface AppFile {
  id: string
  name: string
  size: string
  type: string
  status: 'uploading' | 'completed' | 'error'
  progress: number
}

export function useFileWorkspace(t: any) {
  const [files, setFiles] = useState<AppFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Retrieve or generate a unique sessionId for session isolation
  const [sessionId] = useState(() => {
    let id = sessionStorage.getItem('aira_session_id')
    if (!id) {
      id = 'sess-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36)
      sessionStorage.setItem('aira_session_id', id)
    }
    return id
  })

  // Fetch already uploaded files on load for this session
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`/api/files?sessionId=${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setFiles(data)
        }
      } catch (e) {
        console.error('Error fetching files:', e)
      }
    }
    fetchFiles()
  }, [sessionId])

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

    validFiles.forEach((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'pdf'
      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`

      // Generate a temporary unique ID for tracking upload in UI
      const tempId = 'temp-' + Math.random().toString(36).substring(2, 11)

      const newFile: AppFile = {
        id: tempId,
        name: file.name,
        size: formattedSize,
        type: extension,
        status: 'uploading',
        progress: 0
      }

      setFiles((prev) => [...prev, newFile])

      // Actual HTTP file upload with progress tracking and sessionId query param
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `/api/upload?sessionId=${sessionId}`, true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100)
          setFiles((prev) =>
            prev.map((f) => (f.id === tempId ? { ...f, progress: percentage } : f))
          )
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText)
            setFiles((prev) =>
              prev.map((f) =>
                f.id === tempId
                  ? {
                      ...f,
                      id: res.id, // Update to the real ID returned by backend
                      status: 'completed',
                      progress: 100
                    }
                  : f
              )
            )
          } catch (e) {
            console.error('Failed to parse upload response:', e)
            setFiles((prev) =>
              prev.map((f) => (f.id === tempId ? { ...f, status: 'error' } : f))
            )
          }
        } else {
          // If total size limits or server validations fail, parse error and alert
          if (xhr.status === 400) {
            try {
              const res = JSON.parse(xhr.responseText)
              alert(res.detail || 'Upload failed.')
            } catch (e) {}
          }
          setFiles((prev) =>
            prev.map((f) => (f.id === tempId ? { ...f, status: 'error' } : f))
          )
        }
      }

      xhr.onerror = () => {
        setFiles((prev) =>
          prev.map((f) => (f.id === tempId ? { ...f, status: 'error' } : f))
        )
      }

      xhr.send(formData)
    })
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

  const removeFile = async (id: string) => {
    // Optimistic deletion
    setFiles((prev) => prev.filter((file) => file.id !== id))
    
    try {
      await fetch(`/api/files/${id}?sessionId=${sessionId}`, {
        method: 'DELETE'
      })
    } catch (e) {
      console.error('Error deleting file from backend:', e)
    }
  }

  return {
    files,
    isDragging,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    removeFile,
    sessionId
  }
}
export type UseFileWorkspaceReturn = ReturnType<typeof useFileWorkspace>
