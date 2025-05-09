
import { analyzeSkillSet } from './skills/analyzer';
export { analyzeSkillSet };

export async function calculateSkillScore(
  skills: string[], 
  proficiencyLevels: Record<string, number> = {}
) {
  try {
    // Use the skill analysis utility
    const result = analyzeSkillSet(skills, proficiencyLevels);
    
    // Return the analysis result
    return {
      score: result.score,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendations: result.recommendations
    };
  } catch (error) {
    console.error('Error calculating skill score:', error);
    throw error;
  }
}
