
import { SKILLS_DATABASE } from './database';

export const identifyStrengthsAndWeaknesses = (
  normalizedSkills: string[],
  proficiencyLevels: Record<string, number> = {}
): { strengths: string[], weaknesses: string[] } => {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  normalizedSkills.forEach(skill => {
    const matchedSkill = SKILLS_DATABASE[skill as keyof typeof SKILLS_DATABASE];
    if (matchedSkill) {
      const proficiency = proficiencyLevels[skill] || 5;
      
      if (matchedSkill.demand >= 8 && proficiency >= 7) {
        strengths.push(skill);
      }
      
      if (matchedSkill.demand >= 7 && proficiency <= 4) {
        weaknesses.push(skill);
      }
    }
  });

  return { strengths, weaknesses };
};

