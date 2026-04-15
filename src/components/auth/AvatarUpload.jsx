// Component: AvatarUpload
// Purpose: Upload and display a profile avatar via Supabase Storage
import { useState, useRef } from 'react'
import { uploadFile, BUCKETS } from '../../services/storageService'
import { isSupabaseConfigured } from '../../services/supabaseClient'

export default function AvatarUpload({ userId, currentUrl, initials, onUpdate }) {
  const [uploading, setUploading] = useState(false)
  const [preview,   setPreview]   = useState(currentUrl)
  const inputRef                  = useRef()

  if (!isSupabaseConfigured()) return null

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !userId) return
    setUploading(true)
    try {
      const { url } = await uploadFile(BUCKETS.avatars, userId, file, `${userId}/avatar.${file.name.split('.').pop()}`)
      setPreview(url)
      onUpdate({ avatar_url: url })
    } catch (err) {
      console.error('Avatar upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <label className="relative cursor-pointer group flex-shrink-0">
      {preview ? (
        <img src={preview} alt="Avatar"
          className="w-16 h-16 rounded-full object-cover border-2"
          style={{ borderColor: 'var(--accent)' }} />
      ) : (
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2"
          style={{ backgroundColor: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}
        >
          {initials || '?'}
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 rounded-full flex items-center justify-center bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-white text-xs font-medium">{uploading ? '…' : '📷'}</span>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
    </label>
  )
}
