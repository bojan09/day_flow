// Service: storageService
// Purpose: Upload/download/delete files in Supabase Storage buckets
import { supabase, isSupabaseConfigured } from './supabaseClient'

const BUCKETS = {
  voice:       'voice-journals',
  attachments: 'note-attachments',
  avatars:     'avatars',
}

/**
 * Upload a file to a Supabase Storage bucket.
 * Path is automatically scoped to the user: {userId}/{filename}
 * Returns the public/signed URL on success.
 */
export async function uploadFile(bucket, userId, file, customPath = null) {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured')

  const ext      = file.name?.split('.').pop() || 'bin'
  const filename = customPath || `${userId}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { upsert: true, contentType: file.type })

  if (error) throw error

  // Get signed URL (private buckets) or public URL (avatars)
  if (bucket === BUCKETS.avatars) {
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filename)
    return { path: filename, url: publicUrl }
  }

  const { data: { signedUrl } } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filename, 3600)   // 1 hour

  return { path: filename, url: signedUrl }
}

/**
 * Get a fresh signed URL for a private file (URLs expire after 1 hour)
 */
export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  if (!isSupabaseConfigured()) return null
  const { data: { signedUrl } } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  return signedUrl
}

/**
 * Delete a file from storage
 */
export async function deleteFile(bucket, path) {
  if (!isSupabaseConfigured()) return
  await supabase.storage.from(bucket).remove([path])
}

/**
 * List all files for a user in a bucket
 */
export async function listFiles(bucket, userId) {
  if (!isSupabaseConfigured()) return []
  const { data } = await supabase.storage.from(bucket).list(userId)
  return data ?? []
}

export { BUCKETS }
