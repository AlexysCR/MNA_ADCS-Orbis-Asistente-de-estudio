'use server';
/**
 * @fileOverview Generates next steps and references for study topics or tasks from a voice note.
 *
 * - generateNextStepsAndReferences - A function that generates next steps and references.
 * - GenerateNextStepsAndReferencesInput - The input type for the generateNextStepsAndReferences function.
 * - GenerateNextStepsAndReferencesOutput - The return type for the generateNextStepsAndReferences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNextStepsAndReferencesInputSchema = z.object({
  voiceNoteSummary: z
    .string()
    .describe('A summary of the voice note content.'),
  topic: z.string().describe('The topic of the voice note (study or task).'),
});

export type GenerateNextStepsAndReferencesInput = z.infer<
  typeof GenerateNextStepsAndReferencesInputSchema
>;

const GenerateNextStepsAndReferencesOutputSchema = z.object({
  nextSteps: z.array(z.string()).describe('A list of next steps.'),
  references: z
    .array(z.string())
    .describe('A list of relevant references (e.g., URLs, book titles).'),
});

export type GenerateNextStepsAndReferencesOutput = z.infer<
  typeof GenerateNextStepsAndReferencesOutputSchema
>;

export async function generateNextStepsAndReferences(
  input: GenerateNextStepsAndReferencesInput
): Promise<GenerateNextStepsAndReferencesOutput> {
  return generateNextStepsAndReferencesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNextStepsAndReferencesPrompt',
  input: {schema: GenerateNextStepsAndReferencesInputSchema},
  output: {schema: GenerateNextStepsAndReferencesOutputSchema},
  prompt: `You are a helpful AI assistant that provides next steps and references for a given topic based on a voice note summary. The topic is described as {{{topic}}}. Provide the answer in a JSON format.  Make sure the nextSteps and references list are actionable and specific.

Voice Note Summary: {{{voiceNoteSummary}}}`,
});

const generateNextStepsAndReferencesFlow = ai.defineFlow(
  {
    name: 'generateNextStepsAndReferencesFlow',
    inputSchema: GenerateNextStepsAndReferencesInputSchema,
    outputSchema: GenerateNextStepsAndReferencesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
