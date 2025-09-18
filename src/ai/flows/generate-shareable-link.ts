'use server';
/**
 * @fileOverview Generates a unique, shareable download link for uploaded files, deciding whether to password protect the link depending on the content type.
 *
 * - generateShareableLink - A function that handles the link generation process.
 * - GenerateShareableLinkInput - The input type for the generateShareableLink function.
 * - GenerateShareableLinkOutput - The return type for the generateShareableLink function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateShareableLinkInputSchema = z.object({
  fileType: z.string().describe('The type of the uploaded file.'),
  fileNames: z.array(z.string()).describe('The names of the uploaded files.'),
});
export type GenerateShareableLinkInput = z.infer<typeof GenerateShareableLinkInputSchema>;

const GenerateShareableLinkOutputSchema = z.object({
  shareableLink: z.string().describe('The unique, shareable download link.'),
  isPasswordProtected: z.boolean().describe('Whether the link is password protected.'),
});
export type GenerateShareableLinkOutput = z.infer<typeof GenerateShareableLinkOutputSchema>;

export async function generateShareableLink(input: GenerateShareableLinkInput): Promise<GenerateShareableLinkOutput> {
  return generateShareableLinkFlow(input);
}

const shouldPasswordProtect = ai.defineTool({
  name: 'shouldPasswordProtect',
  description: 'Determines whether a file type should be password protected.',
  inputSchema: z.object({
    fileType: z.string().describe('The type of the uploaded file.'),
  }),
  outputSchema: z.boolean(),
},
async (input) => {
  const sensitiveTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  return sensitiveTypes.includes(input.fileType);
});

const generateLinkPrompt = ai.definePrompt({
  name: 'generateLinkPrompt',
  tools: [shouldPasswordProtect],
  input: {schema: GenerateShareableLinkInputSchema},
  output: {schema: GenerateShareableLinkOutputSchema},
  prompt: `You are a secure link generator.

You will generate a unique, shareable download link for the uploaded files.

First, you must determine if the link should be password protected by using the 'shouldPasswordProtect' tool, based on the file type.

Then, generate a unique, shareable download link. Example: 'https://filedrop.example.com/download/unique-id'.

Return the shareable link and whether it is password protected.

File type: {{{fileType}}}
File names: {{#each fileNames}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}`,
});

const generateShareableLinkFlow = ai.defineFlow(
  {
    name: 'generateShareableLinkFlow',
    inputSchema: GenerateShareableLinkInputSchema,
    outputSchema: GenerateShareableLinkOutputSchema,
  },
  async input => {
    const {output} = await generateLinkPrompt(input);
    return output!;
  }
);
