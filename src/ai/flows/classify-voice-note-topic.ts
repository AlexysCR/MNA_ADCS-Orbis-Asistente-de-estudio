'use server';
/**
 * @fileOverview AI-powered topic classification for voice notes.
 *
 * - classifyVoiceNoteTopic - A function that classifies a voice note into predefined categories.
 * - ClassifyVoiceNoteTopicInput - The input type for the classifyVoiceNoteTopic function.
 * - ClassifyVoiceNoteTopicOutput - The return type for the classifyVoiceNoteTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyVoiceNoteTopicInputSchema = z.object({
  transcription: z
    .string()
    .describe('The transcription of the voice note to classify.'),
});
export type ClassifyVoiceNoteTopicInput = z.infer<
  typeof ClassifyVoiceNoteTopicInputSchema
>;

const ClassifyVoiceNoteTopicOutputSchema = z.object({
  topic: z
    .string()
    .describe(
      'The classified topic of the voice note. Must be one of: Work, Personal, Study, or Other.'
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence level of the classification, between 0 and 1.'),
});
export type ClassifyVoiceNoteTopicOutput = z.infer<
  typeof ClassifyVoiceNoteTopicOutputSchema
>;

export async function classifyVoiceNoteTopic(
  input: ClassifyVoiceNoteTopicInput
): Promise<ClassifyVoiceNoteTopicOutput> {
  return classifyVoiceNoteTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyVoiceNoteTopicPrompt',
  input: {schema: ClassifyVoiceNoteTopicInputSchema},
  output: {schema: ClassifyVoiceNoteTopicOutputSchema},
  prompt: `You are an AI assistant specializing in classifying voice notes into predefined topics.\

  Given the transcription of a voice note, classify it into one of the following categories: Work, Personal, Study, or Other.\
  Also provide a confidence level for your classification (0-1).

  Transcription: {{{transcription}}}
  `,
});

const classifyVoiceNoteTopicFlow = ai.defineFlow(
  {
    name: 'classifyVoiceNoteTopicFlow',
    inputSchema: ClassifyVoiceNoteTopicInputSchema,
    outputSchema: ClassifyVoiceNoteTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
