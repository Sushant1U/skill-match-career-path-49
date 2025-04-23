
import { SKILLS_DATABASE } from './database';
import { generateCareerRecommendations } from './career-recommendations';
import type { SkillAnalysisResult } from './types';

export const analyzeSkillSet = (
  skills: string[], 
  proficiencyLevels: Record<string, number> = {}
): SkillAnalysisResult => {
  // Normalize skills to lowercase for matching
  const normalizedSkills = skills.map(s => s.toLowerCase());
  
  // Calculate base score based on skill demand
  let totalScore = 0;
  let maxPossibleScore = 0;
  let matchedSkillsCount = 0;
  
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Calculate skill score
  normalizedSkills.forEach(skill => {
    const matchedSkill = SKILLS_DATABASE[skill as keyof typeof SKILLS_DATABASE];
    if (matchedSkill) {
      matchedSkillsCount++;
      const proficiency = proficiencyLevels[skill] || 5; // Default proficiency 5/10
      const skillScore = (matchedSkill.demand * proficiency) / 10; // Weight by both demand and proficiency
      
      totalScore += skillScore;
      maxPossibleScore += 10; // Maximum possible score per skill
      
      // Identify strengths (high demand + high proficiency)
      if (matchedSkill.demand >= 8 && proficiency >= 7) {
        strengths.push(skill);
      }
      
      // Identify weaknesses (high demand + low proficiency)
      if (matchedSkill.demand >= 7 && proficiency <= 4) {
        weaknesses.push(skill);
      }
    }
  });
  
  // If no matched skills, return a default low score
  if (matchedSkillsCount === 0) {
    return {
      score: 30, // Base score for having listed skills, even if not in our database
      strengths: [],
      weaknesses: [],
      recommendations: [
        "Add more specific technical skills to your profile",
        "Include proficiency levels for your skills",
        "Add skills that are in high demand in your target industry"
      ]
    };
  }
  
  // Normalize score to 0-100
  let normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);
  
  // Boost score based on skill diversity
  const uniqueIndustries = new Set<string>();
  normalizedSkills.forEach(skill => {
    const matchedSkill = SKILLS_DATABASE[skill as keyof typeof SKILLS_DATABASE];
    if (matchedSkill) {
      matchedSkill.industries.forEach(industry => uniqueIndustries.add(industry));
    }
  });
  
  // Bonus for having a diverse skill set (covering multiple industries)
  const diversityBonus = Math.min(uniqueIndustries.size * 2, 20); // Max 20% boost
  normalizedScore = Math.min(100, normalizedScore + diversityBonus);
  
  // Generate career recommendations
  const recommendations = generateCareerRecommendations(normalizedSkills);
  
  return {
    score: normalizedScore,
    strengths,
    weaknesses,
    recommendations
  };
};
