'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TOPICS, type Topic, type FilterTopic } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Briefcase, User, BrainCircuit, Grip, Inbox, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/firebase";

interface SidebarProps {
  topics: Topic[];
  activeFilter: FilterTopic;
  onFilterChange: (topic: FilterTopic) => void;
  noteCount: number;
}

const topicIcons: Record<Topic, React.ReactNode> = {
  Work: <Briefcase className="size-4" />,
  Personal: <User className="size-4" />,
  Study: <BrainCircuit className="size-4" />,
  Other: <Grip className="size-4" />,
};

export default function Sidebar({ topics, activeFilter, onFilterChange, noteCount }: SidebarProps) {
  const allAppTopics: FilterTopic[] = ['All', ...TOPICS];
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex flex-col bg-muted/50 border-r h-full p-4">
      <div className="flex items-center gap-3 px-2 py-4 mb-4">
        <Sparkles className="text-primary size-8" />
        <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-foreground leading-none">Orbis</h1>
            <span className="text-xs text-muted-foreground">Asistente de estudio</span>
        </div>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {allAppTopics.map(topic => (
          <Button
            key={topic}
            variant={activeFilter === topic ? "secondary" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => onFilterChange(topic)}
          >
            {topic === 'All' ? <Inbox className="size-4" /> : topicIcons[topic as Topic]}
            {topic}
            {topic === 'All' && <span className="ml-auto text-xs text-muted-foreground">{noteCount}</span>}
          </Button>
        ))}
      </nav>
      <div className="mt-auto">
        <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={handleLogout}
        >
            <LogOut className="size-4" />
            Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}
