
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/sonner';

interface Skill {
  name: string;
  proficiency: number;
}

interface SkillInputProps {
  skills: Skill[];
  onAddSkill: (skill: Skill) => void;
  onRemoveSkill: (skillName: string) => void;
  onProficiencyChange: (skillName: string, value: number[]) => void;
}

export function SkillInput({ 
  skills, 
  onAddSkill, 
  onRemoveSkill, 
  onProficiencyChange 
}: SkillInputProps) {
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    const skillName = newSkill.trim();
    if (skills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
      toast.error('This skill is already in your list');
      return;
    }
    
    onAddSkill({ name: skillName, proficiency: 5 });
    setNewSkill('');
  };

  const renderProficiencyLabel = (proficiency: number) => {
    if (proficiency <= 3) return 'Beginner';
    if (proficiency <= 6) return 'Intermediate';
    if (proficiency <= 8) return 'Advanced';
    return 'Expert';
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
          placeholder="Add a skill (e.g. JavaScript, React, UX Design)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-platformBlue focus:border-transparent"
        />
        <Button onClick={handleAddSkill} disabled={!newSkill.trim()}>
          Add Skill
        </Button>
      </div>
      
      <div className="space-y-4">
        {skills.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No skills added yet. Add skills above to get started.
          </p>
        ) : (
          skills.map((skill) => (
            <div key={skill.name} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{skill.name}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {renderProficiencyLabel(skill.proficiency)}
                  </Badge>
                  <button
                    onClick={() => onRemoveSkill(skill.name)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">Beginner</span>
                <Slider
                  value={[skill.proficiency]}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                  onValueChange={(value) => onProficiencyChange(skill.name, value)}
                />
                <span className="text-xs text-gray-500">Expert</span>
                <span className="text-sm font-medium w-6 text-center">{skill.proficiency}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
