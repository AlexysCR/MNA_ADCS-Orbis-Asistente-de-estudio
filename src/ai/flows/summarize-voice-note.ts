'use server';
/**
 * @fileOverview AI-powered summarization of voice notes.
 *
 * - summarizeVoiceNote - A function that summarizes voice notes using AI.
 * - SummarizeVoiceNoteInput - The input type for the summarizeVoiceNote function.
 * - SummarizeVoiceNoteOutput - The return type for the summarizeVoiceNote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeVoiceNoteInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio data URI of the voice note.  Must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  topic: z.string().describe('The topic of the voice note.'),
});

export type SummarizeVoiceNoteInput = z.infer<typeof SummarizeVoiceNoteInputSchema>;

const SummarizeVoiceNoteOutputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of the voice note.'),
});

export type SummarizeVoiceNoteOutput = z.infer<typeof SummarizeVoiceNoteOutputSchema>;

export async function summarizeVoiceNote(
  input: SummarizeVoiceNoteInput
): Promise<SummarizeVoiceNoteOutput> {
  return summarizeVoiceNoteFlow(input);
}

const summarizeVoiceNotePrompt = ai.definePrompt({
  name: 'summarizeVoiceNotePrompt',
  input: {schema: SummarizeVoiceNoteInputSchema},
  output: {schema: SummarizeVoiceNoteOutputSchema},
  prompt: `Summarize the following voice note about {{topic}}.\n\nVoice Note: {{media url=audioDataUri}}\n\nSummary:`,
});

const summarizeVoiceNoteFlow = ai.defineFlow(
  {
    name: 'summarizeVoiceNoteFlow',
    inputSchema: SummarizeVoiceNoteInputSchema,
    outputSchema: SummarizeVoiceNoteOutputSchema,
  },
  async input => {
    const {output} = await summarizeVoiceNotePrompt(input);
    return output!;
  }
);
