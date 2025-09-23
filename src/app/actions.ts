'use server';

import { generateShareableLink, GenerateShareableLinkInput, GenerateShareableLinkOutput } from "@/ai/flows/generate-shareable-link";
import { createClient } from '@/utils/supabase/server';

export async function generateLinkAction(
  input: GenerateShareableLinkInput & { uploadPaths: string[] }
): Promise<GenerateShareableLinkOutput> {
  
  console.log("Generating link for:", input.fileNames.join(", "));
  
  const supabase = createClient();

  // In a real app, you might want to associate the files with a user or a record in your database.
  // For now, we just pass the info to the AI flow.
  
  try {
    const result = await generateShareableLink(input);
    
    // Create a public URL for the first file for simplicity
    // A real app might create a zip or a shared folder link
    const { data } = supabase.storage.from('files').getPublicUrl(input.uploadPaths[0]);

    return {
        ...result,
        shareableLink: data.publicUrl || result.shareableLink,
    };
  } catch (error) {
    console.error("Error generating shareable link:", error);
    throw new Error("Failed to generate shareable link.");
  }
}
