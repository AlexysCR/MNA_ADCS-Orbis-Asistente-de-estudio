import { Timestamp } from "firebase/firestore";

export const TOPICS = ["Work", "Personal", "Study", "Other"] as const;
export type Topic = (typeof TOPICS)[number];
export type FilterTopic = Topic | 'All';

export interface Note {
  id: string;
  userId: string;
  createdAt: Timestamp;
  audioUrl: string;
  transcription: string;
  summary: string;
  topic: Topic;
  confidence: number;
  nextSteps: string[];
  references: string[];
}
