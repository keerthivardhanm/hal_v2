
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
  formData: z.object({
    submitterName: z.string().describe('The name of the person submitting the request.'),
    submitterEmail: z.string().email().describe('The email of the submitter.'),
    organisationName: z.string().describe('The name of the organisation.'),
    submitterIdNo: z.string().describe('The ID number of the submitter.'),
    purpose: z.string().describe('The purpose of the approval request.'),
    requestDate: z.string().describe('The date for which the request is made (YYYY-MM-DD).'), // Assuming date is passed as string
    requestTime: z.string().describe('The time for which the request is made (HH:MM).'),
    numberOfItems: z.number().describe('The number of items requested.'),
    finalSelectedGadgets: z.array(z.string()).describe('A list of selected gadgets, including custom ones if any.'),
  }).describe('The data entered in the submission form.'),
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
  prompt: `You are an AI assistant tasked with generating a concise and professional document content suggestion based on the following approval request form data. The document should be suitable for an official approval letter or record.

  Form Data:
  - Submitter Name: {{{formData.submitterName}}}
  - Submitter Email: {{{formData.submitterEmail}}}
  - Organisation: {{{formData.organisationName}}}
  - Submitter ID: {{{formData.submitterIdNo}}}
  - Purpose of Request: {{{formData.purpose}}}
  - Requested Date: {{{formData.requestDate}}}
  - Requested Time: {{{formData.requestTime}}}
  - Number of Items: {{{formData.numberOfItems}}}
  - Selected Gadgets/Items:
    {{#each formData.finalSelectedGadgets}}
    - {{{this}}}
    {{/each}}

  Based on the above form data, please draft a professional document content. Focus on clearly stating the request details and purpose. Be formal and to the point.
  For example, you might start with "This document confirms a request submitted by..." or "Approval is requested for the following items/purpose:".
  `,
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
