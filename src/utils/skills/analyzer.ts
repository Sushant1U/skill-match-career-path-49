
import { SKILLS_DATABASE } from './database';
import { generateCareerRecommendations } from './career-recommendations';
import { calculateSkillScore, normalizeScore } from './score-calculator';
import { identifyStrengthsAndWeaknesses } from './skill-evaluator';
import type { SkillAnalysisResult } from './types';

export const analyzeSkillSet = (
  skills: string[], 
  proficiencyLevels: Record<string, number> = {}
): SkillAnalysisResult => {
  // Normalize skills to lowercase for matching
  const normalizedSkills = skills.map(s => s.toLowerCase());
  
  // Calculate base scores
  const scoreResult = calculateSkillScore(normalizedSkills, proficiencyLevels);
  
  // If no matched skills, return default result
  if (scoreResult.matchedSkillsCount === 0) {
    return {
      score: 30,
      strengths: [],
      weaknesses: [],
      recommendations: [
        "Add more specific technical skills to your profile",
        "Include proficiency levels for your skills",
        "Add skills that are in high demand in your target industry"
      ]
    };
  }
  
  // Calculate normalized score
  const normalizedScore = normalizeScore(scoreResult);
  
  // Identify strengths and weaknesses
  const { strengths, weaknesses } = identifyStrengthsAndWeaknesses(normalizedSkills, proficiencyLevels);
  
  // Generate career recommendations
  const recommendations = generateCareerRecommendations(normalizedSkills);
  
  return {
    score: normalizedScore,
    strengths,
    weaknesses,
    recommendations
  };
};

