
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

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
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
          context: messages.slice(-4) // Send last 4 messages for context
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response from AI assistant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] max-w-2xl mx-auto">
      <div className="p-4 border-b bg-muted/50 flex items-center gap-2">
        <Bot className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Career Assistant</h2>
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
              <Bot className="h-8 w-8 p-1.5 rounded-full bg-primary/10 text-primary shrink-0" />
            ) : (
              <User className="h-8 w-8 p-1.5 rounded-full bg-muted shrink-0" />
            )}
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                message.role === 'assistant'
                  ? 'bg-muted/50'
                  : 'bg-primary text-primary-foreground ml-auto'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 items-start">
            <Bot className="h-8 w-8 p-1.5 rounded-full bg-primary/10 text-primary animate-pulse" />
            <div className="bg-muted/50 rounded-lg px-4 py-2">
              Thinking...
            </div>
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about career advice, resume tips, or job search..."
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
