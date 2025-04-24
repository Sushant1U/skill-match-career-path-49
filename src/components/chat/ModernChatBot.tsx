
import React, { useState, useRef, useEffect, FormEvent, ReactNode } from 'react';
import { Bot, Send, User, FileText, Lightbulb, Briefcase, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { cva, type VariantProps } from 'class-variance-authority';
import { Job } from '@/types';
import { JobSuggestions } from './JobSuggestions';
import { ResumeBuilder } from './ResumeBuilder';

// Define a variant for message bubble styles
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

// Resume form interface
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

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Suggestions for quick queries
  const suggestions = [
    { text: "Help me build a resume", icon: <FileText className="h-3 w-3" /> },
    { text: "Show me job matches", icon: <Briefcase className="h-3 w-3" /> },
    { text: "Interview tips", icon: <Lightbulb className="h-3 w-3" /> }
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() && isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Check if it's a resume request
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
      
      // Check if it's a job search request
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

        if (error) {
          console.error('Chat error:', error);
          throw new Error(error.message || 'Failed to get response from Sarthi');
        }

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
      
      // Regular chat message
      console.log('Sending message to career-ai-chat function');
      const { data, error } = await supabase.functions.invoke('career-ai-chat', {
        body: {
          message: userMessage,
          context: messages.slice(-4).map(m => ({ role: m.role, content: m.content })),
        }
      });

      if (error) {
        console.error('Chat error:', error);
        throw new Error(error.message || 'Failed to get response from Sarthi');
      }

      if (!data || !data.response) {
        console.error('Invalid response data:', data);
        throw new Error('Invalid response received from Sarthi');
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);
      
      // If the AI mentioned jobs, show job suggestions
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
      // Call the edge function to generate resume content
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

      if (error) {
        throw new Error(error.message || 'Failed to create resume');
      }

      if (!data || !data.resumeContent) {
        throw new Error('Invalid response when creating resume');
      }

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

      if (!error && data && data.jobs) {
        const jobData = data.jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          skills: job.skills || [],
          qualifications: job.qualifications || [],
        }));

        setSuggestedJobs(jobData);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
  };
  
  // Toggle resume maker form
  const toggleResumeForm = () => {
    setShowResumeForm(prev => ({ 
      ...prev, 
      isOpen: !prev.isOpen 
    }));
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
          onClick={toggleResumeForm}
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
          <div
            key={i}
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
            
            <div className={messageBubbleVariants({ role: message.role })}>
              {message.content}
              
              {/* Show job suggestions if available */}
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
        ))}
        
        {/* Show job suggestions block for job-related queries */}
        {suggestedJobs.length > 0 && messages[messages.length - 1]?.role === 'assistant' && (
          <div className="flex justify-start mb-4 ml-10">
            <JobSuggestions jobs={suggestedJobs} />
          </div>
        )}
        
        {isLoading && (
          <div className="flex gap-2 items-start mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-platformPurple to-platformBlue animate-pulse">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className={messageBubbleVariants({ role: 'assistant', thinking: true })}>
              <div className="flex space-x-1 items-center h-6">
                <div className="w-2 h-2 rounded-full bg-platformPurple/70 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 rounded-full bg-platformBlue/70 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 rounded-full bg-platformPurple/70 animate-bounce"></div>
                <span className="ml-2 text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </ScrollArea>

      {/* Quick suggestions */}
      {messages.length < 3 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, i) => (
              <Button 
                key={i}
                variant="outline"
                size="sm"
                className="text-xs bg-white/80 hover:bg-platformPurple/5 border-purple-100"
                onClick={() => handleSuggestion(suggestion.text)}
              >
                {suggestion.icon}
                <span className="ml-1">{suggestion.text}</span>
              </Button>
            ))}
          </div>
        </div>
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
      
      {/* Resume Form Dialog */}
      {showResumeForm.isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg bg-gradient-to-r from-platformPurple to-platformBlue bg-clip-text text-transparent">
                Resume Builder
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowResumeForm({isOpen: false})}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name*</label>
                <Input 
                  value={showResumeForm.fullName || ''}
                  onChange={(e) => setShowResumeForm(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address*</label>
                <Input 
                  value={showResumeForm.email || ''}
                  onChange={(e) => setShowResumeForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john.doe@example.com"
                  type="email"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Education*</label>
                <Input 
                  value={showResumeForm.education || ''}
                  onChange={(e) => setShowResumeForm(prev => ({ ...prev, education: e.target.value }))}
                  placeholder="BS Computer Science, University Name, Year"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Skills (comma separated)*</label>
                <Input 
                  value={showResumeForm.skills?.join(', ') || ''}
                  onChange={(e) => setShowResumeForm(prev => ({ 
                    ...prev, 
                    skills: e.target.value.split(',').map(skill => skill.trim()) 
                  }))}
                  placeholder="JavaScript, React, Node.js"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Work Experience</label>
                <textarea 
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-platformPurple"
                  value={showResumeForm.experience || ''}
                  onChange={(e) => setShowResumeForm(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Software Engineer at Company (2020-2023): Developed features for web applications..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Projects</label>
                <textarea 
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-platformPurple"
                  value={showResumeForm.projects || ''}
                  onChange={(e) => setShowResumeForm(prev => ({ ...prev, projects: e.target.value }))}
                  placeholder="E-commerce Website: Built using React and Node.js..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowResumeForm({isOpen: false})}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-platformPurple to-platformBlue hover:opacity-90"
                onClick={() => submitResumeForm(showResumeForm)}
              >
                Create Resume
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Resume Builder Dialog */}
      <ResumeBuilder 
        isOpen={showResumeBuilder}
        onClose={() => setShowResumeBuilder(false)}
        resumeContent={resumeContent}
      />
    </Card>
  );
}
