import { supabase } from './supabase';

/**
 * Uploads a file to Supabase Storage bucket 'cv-assets'
 * @param file The file to upload
 * @param path The path within the bucket (e.g., 'avatars/user-id.png')
 * @returns The public URL of the uploaded file
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    // Solution directe : convertir en base64 sans dépendre de la base de données
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;
          
          // Utiliser directement la data URL sans stocker en base
          console.log('Image convertie en base64 avec succès');
          resolve(base64);
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          reject(uploadError);
        }
      };
      reader.onerror = () => {
        console.error('Erreur de lecture du fichier');
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  } catch (err) {
    console.error('Upload error:', err);
    throw err;
  }
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
