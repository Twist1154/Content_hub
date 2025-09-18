'use server';

import { generateShareableLink, GenerateShareableLinkInput, GenerateShareableLinkOutput } from "@/ai/flows/generate-shareable-link";

export async function generateLinkAction(
  input: GenerateShareableLinkInput
): Promise<GenerateShareableLinkOutput> {
  // In a real app, you would handle file uploads to a storage service (e.g., Firebase Storage)
  // and then generate a link. Here, we are just calling the AI flow.
  console.log("Generating link for:", input.fileNames.join(", "));
  
  try {
    const result = await generateShareableLink(input);
    return result;
  } catch (error) {
    console.error("Error generating shareable link:", error);
    throw new Error("Failed to generate shareable link.");
  }
}
