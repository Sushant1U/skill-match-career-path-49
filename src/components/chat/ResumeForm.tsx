
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface ResumeFormProps {
  formData: {
    isOpen: boolean;
    fullName?: string;
    email?: string;
    education?: string;
    skills?: string[];
    experience?: string;
    projects?: string;
  };
  onClose: () => void;
  onSubmit: (formData: ResumeFormProps['formData']) => void;
  onChange: (updates: Partial<ResumeFormProps['formData']>) => void;
}

export function ResumeForm({ formData, onClose, onSubmit, onChange }: ResumeFormProps) {
  if (!formData.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg bg-gradient-to-r from-platformPurple to-platformBlue bg-clip-text text-transparent">
            Resume Builder
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name*</label>
            <Input 
              value={formData.fullName || ''}
              onChange={(e) => onChange({ fullName: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address*</label>
            <Input 
              value={formData.email || ''}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="john.doe@example.com"
              type="email"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Education*</label>
            <Input 
              value={formData.education || ''}
              onChange={(e) => onChange({ education: e.target.value })}
              placeholder="BS Computer Science, University Name, Year"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Skills (comma separated)*</label>
            <Input 
              value={formData.skills?.join(', ') || ''}
              onChange={(e) => onChange({ 
                skills: e.target.value.split(',').map(skill => skill.trim()) 
              })}
              placeholder="JavaScript, React, Node.js"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Work Experience</label>
            <textarea 
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-platformPurple"
              value={formData.experience || ''}
              onChange={(e) => onChange({ experience: e.target.value })}
              placeholder="Software Engineer at Company (2020-2023): Developed features for web applications..."
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Projects</label>
            <textarea 
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-platformPurple"
              value={formData.projects || ''}
              onChange={(e) => onChange({ projects: e.target.value })}
              placeholder="E-commerce Website: Built using React and Node.js..."
              rows={3}
            />
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="bg-gradient-to-r from-platformPurple to-platformBlue hover:opacity-90"
            onClick={() => onSubmit(formData)}
          >
            Create Resume
          </Button>
        </div>
      </div>
    </div>
  );
}
