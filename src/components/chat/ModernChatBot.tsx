import { useState, useRef, useEffect, FormEvent } from 'react';
import { Bot, Send, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Job } from '@/types';
import { JobSuggestions } from './JobSuggestions';
import { ResumeBuilder } from './ResumeBuilder';
import { ResumeForm } from './ResumeForm';
import { ChatMessage } from './ChatMessage';
import { QuickSuggestions } from './QuickSuggestions';

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
  jobs?: Job[];
}

interface ResumeForm {
  isOpen: boolean;
  fullName?: string;
  email?: string;
  education?: string;
  skills?: string[];
  experience?: string;
  projects?: string;
}

export function ModernChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Sarthi, your career guidance assistant. I can help with resume building, job search strategies, and interview preparation. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);
  const [showResumeForm, setShowResumeForm] = useState<ResumeForm>({ isOpen: false });
  const [resumeContent, setResumeContent] = useState<string>('');
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      if (userMessage.toLowerCase().includes('resume') && 
          (userMessage.toLowerCase().includes('build') || 
           userMessage.toLowerCase().includes('create') || 
           userMessage.toLowerCase().includes('make'))) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I'd be happy to help you create a professional resume! To get started, I'll need some information from you. Please provide your:"
        }]);
        
        setShowResumeForm({ 
          isOpen: true,
          fullName: '',
          email: '',
          education: '',
          skills: [],
          experience: '',
          projects: ''
        });
        
        setIsLoading(false);
        return;
      }
      
      if ((userMessage.toLowerCase().includes('job') || userMessage.toLowerCase().includes('work')) && 
          (userMessage.toLowerCase().includes('find') || 
           userMessage.toLowerCase().includes('search') || 
           userMessage.toLowerCase().includes('show') ||
           userMessage.toLowerCase().includes('suggest') ||
           userMessage.toLowerCase().includes('recommend'))) {
        
        const { data, error } = await supabase.functions.invoke('career-ai-chat', {
          body: {
            message: userMessage,
            context: messages.slice(-4).map(m => ({ role: m.role, content: m.content })),
            action: 'get_jobs',
          }
        });

        if (error) throw error;

        if (data && data.jobs) {
          const jobData = data.jobs.map((job: any) => ({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            skills: job.skills || [],
            qualifications: job.qualifications || [],
          }));

          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: data.response || "Here are some job recommendations based on available listings:",
            jobs: jobData
          }]);
          
          setSuggestedJobs(jobData);
        } else {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "I couldn't find any job listings at the moment. Please check back later or try a different search." 
          }]);
        }
        
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('career-ai-chat', {
        body: {
          message: userMessage,
          context: messages.slice(-4).map(m => ({ role: m.role, content: m.content })),
        }
      });

      if (error) throw error;

      if (!data?.response) {
        throw new Error('Invalid response received from Sarthi');
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);
      
      if (data.hasJobContext && data.response.toLowerCase().includes('job')) {
        await fetchAvailableJobs();
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response from Sarthi. Please try again.');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, but I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitResumeForm = async (formData: ResumeForm) => {
    if (!formData.fullName || !formData.skills || !formData.education) {
      toast.error("Please fill in all required fields");
      return;
    }

    setShowResumeForm({ isOpen: false });
    setMessages(prev => [...prev, { 
      role: 'system', 
      content: "Creating your professional resume..." 
    }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('career-ai-chat', {
        body: {
          action: 'create_resume',
          resumeData: {
            fullName: formData.fullName,
            email: formData.email,
            education: formData.education,
            skills: formData.skills,
            experience: formData.experience,
            projects: formData.projects
          }
        }
      });

      if (error) throw error;
      if (!data?.resumeContent) throw new Error('Invalid response when creating resume');

      setResumeContent(data.resumeContent);
      setShowResumeBuilder(true);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I've created your professional resume! You can now download it as a PDF or copy the text." 
      }]);

    } catch (error) {
      console.error('Resume creation error:', error);
      toast.error('Failed to create resume. Please try again.');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, but I encountered an issue creating your resume. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableJobs = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('career-ai-chat', {
        body: { action: 'get_jobs' }
      });

      if (!error && data?.jobs) {
        setSuggestedJobs(data.jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          skills: job.skills || [],
          qualifications: job.qualifications || [],
        })));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  return (
    <Card className="relative flex flex-col h-[450px] bg-gradient-to-br from-platformPurple/5 via-white/90 to-platformBlue/5 backdrop-blur-sm border-none shadow-lg overflow-hidden">
      <div className="p-4 border-b border-purple-100 bg-white/50 backdrop-blur-md flex items-center gap-2 sticky top-0 z-10">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-platformPurple to-platformBlue">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg bg-gradient-to-r from-platformPurple to-platformBlue bg-clip-text text-transparent">
            Sarthi - Career Assistant
          </h2>
          <p className="text-xs text-gray-500">Powered by Meta's Llama 4 Scout</p>
        </div>
        <Button
          onClick={() => setShowResumeForm(prev => ({ ...prev, isOpen: true }))}
          variant="outline" 
          size="sm" 
          className="ml-auto text-xs flex gap-1 border-platformPurple text-platformPurple hover:bg-platformPurple/10"
        >
          <FileText className="h-3 w-3" />
          Resume Maker
        </Button>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 space-y-4">
        {messages.map((message, i) => (
          <ChatMessage key={i} message={message} />
        ))}
        
        {suggestedJobs.length > 0 && messages[messages.length - 1]?.role === 'assistant' && (
          <div className="flex justify-start mb-4 ml-10">
            <JobSuggestions jobs={suggestedJobs} />
          </div>
        )}
        
        {isLoading && (
          <ChatMessage 
            message={{ 
              role: 'assistant', 
              content: 'Thinking...',
            }} 
            thinking={true}
          />
        )}
        
        <div ref={chatEndRef} />
      </ScrollArea>

      {messages.length < 3 && (
        <QuickSuggestions onSelect={text => setInput(text)} />
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t border-purple-100 bg-white/50 backdrop-blur-md flex gap-2 sticky bottom-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Sarthi about career advice..."
          className="border-gray-200 focus-visible:ring-platformPurple focus-visible:border-platformPurple"
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
      
      <ResumeForm
        formData={showResumeForm}
        onClose={() => setShowResumeForm({ isOpen: false })}
        onSubmit={submitResumeForm}
        onChange={(updates) => setShowResumeForm(prev => ({ ...prev, ...updates }))}
      />
      
      <ResumeBuilder 
        isOpen={showResumeBuilder}
        onClose={() => setShowResumeBuilder(false)}
        resumeContent={resumeContent}
      />
    </Card>
  );
}
