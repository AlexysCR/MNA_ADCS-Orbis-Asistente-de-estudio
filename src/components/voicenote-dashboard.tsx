'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Note, FilterTopic } from '@/lib/types';
import { processVoiceNote } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/voicenotes/sidebar';
import NoteList from '@/components/voicenotes/note-list';
import NoteView from '@/components/voicenotes/note-view';
import { useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export default function VoiceNoteDashboard() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTopic>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const notesCollection = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'voiceNotes'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: notes, isLoading: isLoadingNotes } = useCollection<Note>(notesCollection);

  const handleRecordingComplete = async (audioUrl: string, audioDataUri: string) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be signed in to save a note.",
        });
        return;
    }

    setIsLoading(true);
    setSelectedNoteId(null);
    try {
      const processedData = await processVoiceNote(audioDataUri);
      
      const newNote = {
        userId: user.uid,
        createdAt: serverTimestamp(),
        audioUrl,
        ...processedData,
      };

      const notesRef = collection(firestore, 'users', user.uid, 'voiceNotes');
      const docRef = await addDocumentNonBlocking(notesRef, newNote);

      if (docRef) {
        setSelectedNoteId(docRef.id);
      }
      
      toast({
        title: "Note Processed",
        description: `Your note has been classified as "${newNote.topic}".`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Processing Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'voiceNotes', noteId);
    deleteDocumentNonBlocking(docRef);

    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
    }
    toast({
      title: "Note Deleted",
      description: "The voice note has been successfully deleted.",
    });
  };

  const safeNotes = notes ?? [];

  const filteredNotes = useMemo(() => {
    return safeNotes
      .filter(note => activeFilter === 'All' || note.topic === activeFilter)
      .filter(note =>
        (note.transcription || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.summary || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [safeNotes, activeFilter, searchTerm]);

  const selectedNote = useMemo(() => {
    return safeNotes.find(note => note.id === selectedNoteId) ?? null;
  }, [safeNotes, selectedNoteId]);

  const topics = useMemo(() => {
    const allTopics = new Set(safeNotes.map(note => note.topic));
    return Array.from(allTopics);
  }, [safeNotes]);

  const isDataLoading = isLoading || isLoadingNotes || isUserLoading;

  if (isUserLoading || !user) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[260px_1fr] h-screen bg-background">
      <Sidebar 
        topics={topics} 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter}
        noteCount={safeNotes.length}
      />
      <div className="flex flex-col h-screen">
        <main className="grid md:grid-cols-[minmax(350px,450px)_1fr] flex-1 overflow-hidden">
          <NoteList
            notes={filteredNotes}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            onRecordingComplete={handleRecordingComplete}
            isLoading={isDataLoading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onDeleteNote={handleDeleteNote}
          />
          <NoteView note={selectedNote} isLoading={isDataLoading && !selectedNote} />
        </main>
      </div>
    </div>
  );
}
