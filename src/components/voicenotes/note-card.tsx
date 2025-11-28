"use client";

import type { Note } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export default function NoteCard({ note, isSelected, onSelect, onDelete }: NoteCardProps) {
  const title = note.transcription?.split(' ').slice(0, 8).join(' ') + '...' || 'New Note...';
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:bg-muted/50 transition-colors",
        isSelected && "bg-muted/80 border-primary/50"
      )}
      onClick={onSelect}
    >
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
            <Badge variant={isSelected ? "default" : "secondary"}>{note.topic}</Badge>
            <Button variant="ghost" size="icon" className="size-7 group" onClick={handleDelete}>
                <Trash2 className="size-4 text-muted-foreground group-hover:text-destructive"/>
            </Button>
        </div>
        <CardTitle className="text-base font-semibold pt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
        {note.createdAt ? formatDistanceToNow(note.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
      </CardContent>
    </Card>
  );
}
