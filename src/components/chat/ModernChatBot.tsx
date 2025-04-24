
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export function ModernChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Sarthi, your career guidance assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('career-ai-chat', {
        body: {
          message: userMessage,
          context: messages.slice(-4)
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response from Sarthi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[400px] bg-gradient-to-br from-platformPurple/5 to-platformBlue/5 backdrop-blur-sm border-none shadow-lg">
      <div className="p-4 border-b bg-white/50 backdrop-blur-md flex items-center gap-2">
        <Bot className="h-6 w-6 text-platformPurple" />
        <h2 className="font-semibold text-lg bg-gradient-to-r from-platformPurple to-platformBlue bg-clip-text text-transparent">
          Sarthi - Career Assistant
        </h2>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex gap-2 ${
              message.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'
            }`}
          >
            {message.role === 'assistant' ? (
              <Bot className="h-8 w-8 p-1.5 rounded-full bg-gradient-to-br from-platformPurple to-platformBlue text-white shrink-0" />
            ) : (
              <User className="h-8 w-8 p-1.5 rounded-full bg-gray-100 text-gray-600 shrink-0" />
            )}
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] animate-fade-in ${
                message.role === 'assistant'
                  ? 'bg-white shadow-sm'
                  : 'bg-gradient-to-r from-platformPurple to-platformBlue text-white ml-auto'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 items-start">
            <Bot className="h-8 w-8 p-1.5 rounded-full bg-gradient-to-br from-platformPurple to-platformBlue text-white shrink-0 animate-pulse" />
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              Thinking...
            </div>
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white/50 backdrop-blur-md flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Sarthi about career advice..."
          className="border-gray-200 focus:border-platformPurple"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={isLoading}
          className="bg-gradient-to-r from-platformPurple to-platformBlue hover:opacity-90 transition-opacity"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
