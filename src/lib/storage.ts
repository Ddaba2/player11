import { supabase } from './supabase';

/**
 * Uploads a file to Supabase Storage bucket 'cv-assets'
 * @param file The file to upload
 * @param path The path within the bucket (e.g., 'avatars/user-id.png')
 * @returns The public URL of the uploaded file
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  // 1. Upload the file
  const { data, error } = await supabase.storage
    .from('cv-assets')
    .upload(path, file, {
      upsert: true,
      cacheControl: '3600',
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // 2. Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('cv-assets')
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Deletes a file from Supabase Storage
 * @param path The path within the bucket
 */
export async function deleteImage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('cv-assets')
    .remove([path]);

  if (error) {
    console.error(`Delete failed: ${error.message}`);
  }
}
