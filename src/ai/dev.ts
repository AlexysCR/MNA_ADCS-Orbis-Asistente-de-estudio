import { config } from 'dotenv';
config();

import '@/ai/flows/classify-voice-note-topic.ts';
import '@/ai/flows/generate-next-steps-and-references.ts';
import '@/ai/flows/summarize-voice-note.ts';