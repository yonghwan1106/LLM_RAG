'use client'

import { useState, useCallback } from 'react'
import { Upload, File, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  onUploadSuccess: (documentId: string, filename: string) => void
  onUploadError: (error: string) => void
}

export default function FileUploader({ onUploadSuccess, onUploadError }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(file => file.type === 'application/pdf')
    
    if (pdfFile) {
      uploadFile(pdfFile)
    } else {
      setUploadStatus('error')
      setStatusMessage('PDF 파일만 업로드 가능합니다.')
      onUploadError('PDF 파일만 업로드 가능합니다.')
    }
  }, [onUploadError])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadStatus('idle')
    setStatusMessage('파일을 업로드하고 있습니다...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setUploadStatus('success')
        setStatusMessage(data.message)
        onUploadSuccess(data.document_id, file.name)
      } else {
        setUploadStatus('error')
        setStatusMessage(data.message)
        onUploadError(data.message)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
      setStatusMessage('업로드 중 오류가 발생했습니다.')
      onUploadError('업로드 중 오류가 발생했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          id="file-upload"
        />
        
        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          ) : uploadStatus === 'success' ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : uploadStatus === 'error' ? (
            <AlertCircle className="h-12 w-12 text-red-500" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
          
          <div>
            <p className="text-lg font-medium">
              {isUploading ? '업로드 중...' : 'PDF 파일을 업로드하세요'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {statusMessage || '파일을 드래그 앤 드롭하거나 클릭하여 선택하세요'}
            </p>
          </div>
          
          {!isUploading && uploadStatus !== 'success' && (
            <label
              htmlFor="file-upload"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
            >
              파일 선택
            </label>
          )}
        </div>
      </div>
      
      {uploadStatus === 'success' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">
              파일이 성공적으로 업로드되었습니다. 이제 질문을 입력해보세요!
            </span>
          </div>
        </div>
      )}
    </div>
  )
}