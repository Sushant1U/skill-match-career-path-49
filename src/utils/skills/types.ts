
// Type definitions for the skill analysis system
export interface SkillAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface SkillData {
  industries: string[];
  demand: number;
}

export interface CareerPathSkills {
  primarySkills: string[];
  secondarySkills: string[];
}

export type SkillsDatabase = Record<string, SkillData>;
export type CareerPaths = Record<string, CareerPathSkills>;
