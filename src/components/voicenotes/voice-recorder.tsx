"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Pause, Square, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string, audioDataUri: string) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onRecordingComplete, disabled }: VoiceRecorderProps) {
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [showStopConfirmation, setShowStopConfirmation] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleStartRecording = async () => {
    if (recordingStatus !== 'idle') return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);

            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                const base64data = reader.result as string;
                onRecordingComplete(audioUrl, base64data);
            };
        }
        
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingStatus('recording');
      toast({ title: "Recording started" });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Could not access microphone. Please check your browser permissions.",
      });
    }
  };
  
  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === 'recording') {
        mediaRecorderRef.current.pause();
        setRecordingStatus('paused');
        toast({ title: "Recording paused" });
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === 'paused') {
        mediaRecorderRef.current.resume();
        setRecordingStatus('recording');
        toast({ title: "Recording resumed" });
    }
  };


  const handleStopRecording = () => {
    if (mediaRecorderRef.current && (recordingStatus === 'recording' || recordingStatus === 'paused')) {
      mediaRecorderRef.current.stop();
      setRecordingStatus('idle');
      toast({ title: "Recording stopped", description: "Processing your voice note..." });
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && (recordingStatus === 'recording' || recordingStatus === 'paused')) {
        audioChunksRef.current = []; // Discard chunks
        mediaRecorderRef.current.stop(); // This will trigger onstop, but chunks are empty
        setRecordingStatus('idle');
        toast({ title: "Recording canceled" });
    }
  };

  if (recordingStatus === 'idle') {
    return (
        <Button 
            onClick={handleStartRecording} 
            disabled={disabled}
            className="w-full transition-all"
            variant="default"
            size="lg"
        >
            <div className='flex items-center gap-2'>
                <Mic className="size-4" />
                <span>{disabled ? 'Processing...' : 'Start Recording'}</span>
            </div>
        </Button>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 w-full">
        {recordingStatus === 'recording' && (
            <Button onClick={handlePauseRecording} variant="outline" size="lg" className="flex-1" aria-label="Pause Recording">
                <Pause className="size-5" />
            </Button>
        )}
        {recordingStatus === 'paused' && (
            <Button onClick={handleResumeRecording} variant="outline" size="lg" className="flex-1" aria-label="Resume Recording">
                <Mic className="size-5 text-primary" />
            </Button>
        )}
      <AlertDialog open={showStopConfirmation} onOpenChange={setShowStopConfirmation}>
        <AlertDialogTrigger asChild>
          <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700" aria-label="Stop Recording">
            <Square className="size-5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finish Recording?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop the recording and save this voice note?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStopRecording} className="bg-green-600 hover:bg-green-700">
              Finish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Button onClick={handleCancelRecording} variant="destructive" size="lg" className="flex-1" aria-label="Cancel Recording">
        <Trash2 className="size-5" />
      </Button>
    </div>
  );
}
