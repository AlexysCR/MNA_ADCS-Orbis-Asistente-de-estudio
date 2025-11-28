"use client";

import type { Note } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import NoteCard from "./note-card";
import VoiceRecorder from "./voice-recorder";
import { Input } from "@/components/ui/input";
import { Search, PenSquare } from "lucide-react";

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onRecordingComplete: (audioUrl: string, audioDataUri: string) => void;
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onDeleteNote: (id: string) => void;
}

export default function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onRecordingComplete,
  isLoading,
  searchTerm,
  onSearchChange,
  onDeleteNote,
}: NoteListProps) {
  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input 
            placeholder="Search notes..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {notes.length === 0 && !isLoading && (
          <div className="text-center p-8 text-muted-foreground flex flex-col items-center gap-4 mt-16">
            <PenSquare className="size-12"/>
            <h3 className="font-semibold">No notes yet</h3>
            <p className="text-sm">Record your first voice note to get started.</p>
          </div>
        )}
        <div className="p-2 space-y-2">
          {notes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note}
              isSelected={note.id === selectedNoteId}
              onSelect={() => onSelectNote(note.id)}
              onDelete={() => onDeleteNote(note.id)}
            />
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-muted/20">
        <VoiceRecorder onRecordingComplete={onRecordingComplete} disabled={isLoading} />
      </div>
    </div>
  );
}
