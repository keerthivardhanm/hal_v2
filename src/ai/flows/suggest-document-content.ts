// src/ai/flows/suggest-document-content.ts
'use server';

/**
 * @fileOverview Provides AI-powered suggestions for document content based on submission form data.
 *
 * - suggestDocumentContent - A function that generates document content suggestions.
 * - SuggestDocumentContentInput - The input type for the suggestDocumentContent function.
 * - SuggestDocumentContentOutput - The return type for the suggestDocumentContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDocumentContentInputSchema = z.object({
  formData: z.record(z.any()).describe('The data entered in the submission form.'),
});
export type SuggestDocumentContentInput = z.infer<typeof SuggestDocumentContentInputSchema>;

const SuggestDocumentContentOutputSchema = z.object({
  documentContentSuggestion: z
    .string()
    .describe('The AI-powered suggestion for the document content.'),
});
export type SuggestDocumentContentOutput = z.infer<typeof SuggestDocumentContentOutputSchema>;

export async function suggestDocumentContent(
  input: SuggestDocumentContentInput
): Promise<SuggestDocumentContentOutput> {
  return suggestDocumentContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDocumentContentPrompt',
  input: {schema: SuggestDocumentContentInputSchema},
  output: {schema: SuggestDocumentContentOutputSchema},
  prompt: `You are an AI assistant helping administrators generate document content based on the provided form data.

  Form Data:
  {{#each formData}}
    {{@key}}: {{{this}}}
  {{/each}}

  Based on the above form data, suggest content for a document. Be concise and professional.`,
});

const suggestDocumentContentFlow = ai.defineFlow(
  {
    name: 'suggestDocumentContentFlow',
    inputSchema: SuggestDocumentContentInputSchema,
    outputSchema: SuggestDocumentContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
