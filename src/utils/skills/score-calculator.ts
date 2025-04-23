
import { SKILLS_DATABASE } from './database';

export interface ScoreResult {
  totalScore: number;
  maxPossibleScore: number;
  matchedSkillsCount: number;
  uniqueIndustries: Set<string>;
}

export const calculateSkillScore = (
  normalizedSkills: string[],
  proficiencyLevels: Record<string, number> = {}
): ScoreResult => {
  let totalScore = 0;
  let maxPossibleScore = 0;
  let matchedSkillsCount = 0;
  const uniqueIndustries = new Set<string>();

  normalizedSkills.forEach(skill => {
    const matchedSkill = SKILLS_DATABASE[skill as keyof typeof SKILLS_DATABASE];
    if (matchedSkill) {
      matchedSkillsCount++;
      const proficiency = proficiencyLevels[skill] || 5;
      const skillScore = (matchedSkill.demand * proficiency) / 10;
      
      totalScore += skillScore;
      maxPossibleScore += 10;
      
      matchedSkill.industries.forEach(industry => uniqueIndustries.add(industry));
    }
  });

  return {
    totalScore,
    maxPossibleScore,
    matchedSkillsCount,
    uniqueIndustries
  };
};

export const normalizeScore = (scoreResult: ScoreResult): number => {
  let score = Math.round((scoreResult.totalScore / scoreResult.maxPossibleScore) * 100);
  const diversityBonus = Math.min(scoreResult.uniqueIndustries.size * 2, 20);
  return Math.min(100, score + diversityBonus);
};

