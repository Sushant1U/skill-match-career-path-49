
import { Bot, User } from 'lucide-react';
import { Job } from '@/types';
import { JobSuggestions } from './JobSuggestions';
import { cva } from 'class-variance-authority';

const messageBubbleVariants = cva(
  "rounded-2xl px-4 py-2 max-w-[85%] backdrop-blur-sm animate-fade-in",
  {
    variants: {
      role: {
        assistant: "bg-gradient-to-br from-platformPurple/10 to-platformBlue/10 border border-purple-100 shadow-sm text-gray-800",
        user: "bg-gradient-to-r from-platformPurple to-platformBlue text-white ml-auto",
        system: "bg-amber-50 border border-amber-200 text-amber-800 mx-auto text-center text-sm",
      },
      thinking: {
        true: "animate-pulse",
        false: "",
      }
    },
    defaultVariants: {
      role: "user",
      thinking: false
    }
  }
);

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
  jobs?: Job[];
}

interface ChatMessageProps {
  message: Message;
  thinking?: boolean;
}

export function ChatMessage({ message, thinking = false }: ChatMessageProps) {
  return (
    <div
      className={`flex gap-2 mb-4 ${
        message.role === 'user' ? 'justify-end' : 
        message.role === 'system' ? 'justify-center' : 'justify-start'
      }`}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 flex-shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-platformPurple to-platformBlue overflow-hidden">
            <Bot className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
      
      <div className={messageBubbleVariants({ role: message.role, thinking })}>
        {message.content}
        
        {message.jobs && message.jobs.length > 0 && (
          <JobSuggestions jobs={message.jobs} />
        )}
      </div>
      
      {message.role === 'user' && (
        <div className="w-8 h-8 flex-shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
            <User className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      )}
    </div>
  );
}
