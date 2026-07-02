// Component: NoteAttachments
// Purpose: Upload and display file attachments on a note — images preview inline, others as links
import { useState, useRef } from 'react'
import { uploadFile, deleteFile, BUCKETS } from '../../services/storageService'
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured } from '../../services/supabaseClient'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default function NoteAttachments({ noteId, attachments = [], onUpdate }) {
  const { user }      = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState(null)
  const inputRef                  = useRef()

  if (!isSupabaseConfigured()) return null

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !user) return
    setUploading(true); setError(null)
    try {
      const { path, url } = await uploadFile(BUCKETS.attachments, user.id, file, `${user.id}/${noteId}/${file.name}`)
      const newAttachment = { path, url, name: file.name, type: file.type, size: file.size, uploadedAt: new Date().toISOString() }
      onUpdate([...attachments, newAttachment])
    } catch (err) {
      setError('Upload failed — ' + err.message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDelete = async (attachment) => {
    try {
      await deleteFile(BUCKETS.attachments, attachment.path)
      onUpdate(attachments.filter(a => a.path !== attachment.path))
    } catch (err) {
      setError('Delete failed — ' + err.message)
    }
  }

  const formatSize = (bytes) => bytes < 1024 ? `${bytes}B` : bytes < 1048576 ? `${(bytes/1024).toFixed(1)}KB` : `${(bytes/1048576).toFixed(1)}MB`

  return (
    <div className="space-y-2">
      {/* Existing attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map(a => (
            <div key={a.path}
              className="flex items-center gap-3 p-2.5 rounded-xl border group"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
              {IMAGE_TYPES.includes(a.type) ? (
                <img src={a.url} alt={a.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  {a.type === 'application/pdf' ? '📄' : '📎'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <a href={a.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-medium truncate block hover:underline"
                  style={{ color: 'var(--text)' }}>{a.name}</a>
                <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{formatSize(a.size)}</span>
              </div>
              <button
                onClick={() => handleDelete(a)}
                className="hover-danger opacity-0 group-hover:opacity-100 text-xs p-1 transition-all"
                style={{ color: 'var(--text-faint)' }}
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <label
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed cursor-pointer transition-all"
        style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
      >
        <span className="text-base">{uploading ? '⏳' : '📎'}</span>
        <span className="text-xs">{uploading ? 'Uploading…' : 'Attach file'}</span>
        <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
