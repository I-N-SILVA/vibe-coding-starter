import { createClient } from './client';

const supabase = createClient();

/**
 * Upload an image to a Supabase storage bucket.
 * 
 * @param file The file to upload
 * @param bucket The bucket name (e.g., 'avatars', 'logos')
 * @param path The path within the bucket (e.g., 'profiles/user-id.png')
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(file: File, bucket: string, path: string): Promise<string> {
    // 1. Upload the file
    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            upsert: true,
            contentType: file.type,
        });

    if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // 2. Get the public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

    return publicUrl;
}
