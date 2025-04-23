
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

interface SkillsListProps {
  skills: string[];
  onAddSkill?: (skill: string) => void;
  onRemoveSkill?: (skill: string) => void;
  editable?: boolean;
}

export function SkillsList({ skills, onAddSkill, onRemoveSkill, editable = false }: SkillsListProps) {
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && onAddSkill) {
      onAddSkill(newSkill.trim());
      setNewSkill('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {skills.length === 0 ? (
          <p className="text-gray-500 text-sm">No skills added yet.</p>
        ) : (
          skills.map((skill, index) => (
            <div key={index} className="flex items-center">
              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                {skill}
                {editable && onRemoveSkill && (
                  <button
                    onClick={() => onRemoveSkill(skill)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            </div>
          ))
        )}
      </div>

      {editable && onAddSkill && (
        <div className="flex mt-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a skill"
              className="w-full py-1 px-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-platformBlue focus:border-transparent"
            />
          </div>
          <Button 
            size="sm" 
            onClick={handleAddSkill}
            disabled={!newSkill.trim()}
            className="ml-2"
          >
            <PlusIcon className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      )}
    </div>
  );
}
