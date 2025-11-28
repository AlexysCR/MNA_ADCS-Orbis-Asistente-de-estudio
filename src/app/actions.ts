'use server';

import { classifyVoiceNoteTopic } from '@/ai/flows/classify-voice-note-topic';
import { generateNextStepsAndReferences } from '@/ai/flows/generate-next-steps-and-references';
import { summarizeVoiceNote } from '@/ai/flows/summarize-voice-note';
import type { Note, Topic } from '@/lib/types';

type ProcessedNote = Omit<Note, 'id' | 'createdAt' | 'audioUrl'>;

export async function processVoiceNote(
  audioDataUri: string
): Promise<ProcessedNote> {
  try {
    // Step 1: Transcribe the audio by using the summarize flow with a specific instruction.
    const transcriptionResult = await summarizeVoiceNote({
      audioDataUri,
      topic: 'a detailed and accurate transcription of the audio',
    });
    const transcription = transcriptionResult.summary;

    if (!transcription) {
      throw new Error('Transcription failed: The audio could not be transcribed.');
    }

    // Step 2: Classify the topic based on the transcription.
    const classificationResult = await classifyVoiceNoteTopic({
      transcription,
    });
    const topic = classificationResult.topic as Topic;
    const confidence = classificationResult.confidence;

    // Step 3: Summarize the audio with the correctly identified topic.
    const summaryResult = await summarizeVoiceNote({
      audioDataUri,
      topic: topic,
    });
    const summary = summaryResult.summary;
    
    let nextSteps: string[] = [];
    let references: string[] = [];

    // Step 4: Generate next steps and references if the topic is 'Study' or 'Work'.
    if (topic === 'Study' || topic === 'Work') {
      try {
        const taskResult = await generateNextStepsAndReferences({
          voiceNoteSummary: summary,
          topic: topic,
        });
        nextSteps = taskResult.nextSteps;
        references = taskResult.references;
      } catch (error) {
          console.warn('Could not generate next steps:', error);
          // Non-critical error, so we can continue without next steps.
      }
    }
    
    return {
      transcription,
      summary,
      topic,
      confidence,
      nextSteps,
      references,
    };
  } catch (error) {
    console.error('Error processing voice note:', error);
    throw new Error('An error occurred while processing the voice note with AI. Please try again.');
  }
}
