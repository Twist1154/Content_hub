'use server';

import { generateShareableLink, GenerateShareableLinkInput, GenerateShareableLinkOutput } from "@/ai/flows/generate-shareable-link";
import { createClient } from '@/utils/supabase/server';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import axios from 'axios';

async function createZipArchive(fileUrls: string[]): Promise<string> {
    const supabase = createClient({ useServiceRole: true });
    const zipFileName = `hapohub-archive-${Date.now()}.zip`;
    const archive = archiver('zip', { zlib: { level: 9 } });
    const passThrough = new PassThrough();

    archive.pipe(passThrough);

    await Promise.all(
        fileUrls.map(async (url) => {
            try {
                const response = await axios.get(url, { responseType: 'stream' });
                const filename = new URL(url).pathname.split('/').pop() || 'file';
                archive.append(response.data, { name: filename });
            } catch (error) {
                console.error(`Failed to download or append file: ${url}`, error);
                archive.append(`Failed to download: ${url}\n`, { name: `error_log.txt` });
            }
        })
    );

    archive.finalize();

    const { error } = await supabase.storage
        .from('files')
        .upload(`archives/${zipFileName}`, passThrough, {
            contentType: 'application/zip',
        });

    if (error) {
        throw new Error(`Failed to upload zip archive: ${error.message}`);
    }

    const { data } = supabase.storage.from('files').getPublicUrl(`archives/${zipFileName}`);
    return data.publicUrl;
}

export async function generateLinkAction(
  input: GenerateShareableLinkInput & { uploadPaths: string[] }
): Promise<GenerateShareableLinkOutput> {
  
  console.log("Generating link for:", input.fileNames.join(", "));
  
  const supabase = createClient();
  
  try {
    const result = await generateShareableLink(input);

    let finalLink = result.shareableLink;

    if (input.uploadPaths.length > 1) {
        // For multiple files, create a zip and get a public URL for it.
        const publicUrls = input.uploadPaths.map(path => {
            return supabase.storage.from('files').getPublicUrl(path).data.publicUrl;
        });
        finalLink = await createZipArchive(publicUrls);
    } else if (input.uploadPaths.length === 1) {
        // For a single file, just get its public URL.
        const { data } = supabase.storage.from('files').getPublicUrl(input.uploadPaths[0]);
        finalLink = data.publicUrl;
    }

    return {
        ...result,
        shareableLink: finalLink,
    };
  } catch (error) {
    console.error("Error generating shareable link:", error);
    throw new Error("Failed to generate shareable link.");
  }
}
