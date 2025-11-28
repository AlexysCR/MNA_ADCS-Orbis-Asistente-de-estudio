"use client";

import type { Note } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText, ListTodo, Book, ScrollText, Bot } from "lucide-react";

interface NoteViewProps {
  note: Note | null;
  isLoading: boolean;
}

function LoadingSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="font-semibold text-lg">AI is thinking...</p>
            <p className="text-sm text-center">Your voice note is being transcribed, summarized, and analyzed.</p>
        </div>
    )
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 gap-4">
            <Bot className="size-16" />
            <h3 className="font-semibold text-lg">Select a note to view details</h3>
            <p className="text-sm text-center">Or record a new voice note to see the AI in action.</p>
        </div>
    )
}

export default function NoteView({ note, isLoading }: NoteViewProps) {
  if (isLoading) return <LoadingSkeleton />;
  if (!note) return <EmptyState />;

  return (
    <div className="bg-muted/20 h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
            <header className="space-y-2">
                <Badge variant="outline">{note.topic}</Badge>
                <h2 className="text-2xl font-bold">{note.transcription?.split(' ').slice(0, 10).join(' ') || 'New Note'}...</h2>
                <p className="text-sm text-muted-foreground">
                    Created on {note.createdAt ? new Date(note.createdAt.toDate()).toLocaleString() : 'Just now'}
                </p>
                {note.audioUrl && <audio controls src={note.audioUrl} className="w-full mt-4" />}
            </header>
            
            <Separator />
            
            {note.transcription && <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-lg"><FileText className="text-primary"/> Transcription</h3>
                <Card>
                    <CardContent className="p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono">{note.transcription}</CardContent>
                </Card>
            </section>}
            
            {note.summary && <Separator />}

            {note.summary && <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-lg"><ScrollText className="text-primary"/> AI Summary</h3>
                <Card>
                    <CardContent className="p-4 text-sm leading-relaxed">{note.summary}</CardContent>
                </Card>
            </section>}

            {note.nextSteps && note.nextSteps.length > 0 && (
                <>
                <Separator />
                <section className="space-y-4">
                    <h3 className="flex items-center gap-2 font-semibold text-lg"><ListTodo className="text-primary"/> Next Steps</h3>
                    <Card>
                        <CardContent className="p-4">
                            <ul className="list-disc list-inside space-y-2 text-sm">
                                {note.nextSteps.map((step, i) => <li key={i}>{step}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                </section>
                </>
            )}

            {note.references && note.references.length > 0 && (
                <>
                <Separator />
                <section className="space-y-4">
                    <h3 className="flex items-center gap-2 font-semibold text-lg"><Book className="text-primary"/> References</h3>
                    <Card>
                        <CardContent className="p-4">
                            <ul className="list-disc list-inside space-y-2 text-sm">
                                {note.references.map((ref, i) => (
                                    <li key={i}>
                                        <a href={ref} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80">
                                            {ref}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </section>
                </>
            )}
        </div>
      </ScrollArea>
    </div>
  );
}
