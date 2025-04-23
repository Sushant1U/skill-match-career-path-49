
import { CAREER_PATHS } from './database';

export const generateCareerRecommendations = (skills: string[]): string[] => {
  const recommendations: string[] = [];
  const pathMatches: Record<string, number> = {};
  
  // Calculate match percentage for each career path
  for (const [path, requiredSkills] of Object.entries(CAREER_PATHS)) {
    const primaryMatches = requiredSkills.primarySkills.filter(skill => 
      skills.includes(skill)
    ).length;
    
    const secondaryMatches = requiredSkills.secondarySkills.filter(skill => 
      skills.includes(skill)
    ).length;
    
    // Weight primary skills more heavily than secondary skills
    const totalWeight = requiredSkills.primarySkills.length * 2 + requiredSkills.secondarySkills.length;
    const score = ((primaryMatches * 2) + secondaryMatches) / totalWeight;
    
    pathMatches[path] = Math.round(score * 100);
  }
  
  // Sort paths by match percentage
  const sortedPaths = Object.entries(pathMatches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3); // Top 3 matches
  
  // Add career path recommendations
  sortedPaths.forEach(([path, match]) => {
    if (match > 30) {
      recommendations.push(`${path} (${match}% match)`);
    }
  });
  
  // Add skill gap recommendations
  if (sortedPaths.length > 0 && sortedPaths[0][1] > 40) {
    const topPath = sortedPaths[0][0] as keyof typeof CAREER_PATHS;
    const missingPrimarySkills = CAREER_PATHS[topPath].primarySkills.filter(
      skill => !skills.includes(skill)
    );
    
    if (missingPrimarySkills.length > 0) {
      recommendations.push(`To improve as a ${topPath}, consider learning: ${missingPrimarySkills.join(', ')}`);
    }
  }
  
  // Add generic recommendations if none were added
  if (recommendations.length === 0) {
    recommendations.push(
      "Consider specializing in a specific tech stack or domain",
      "Add more technical skills to your profile to get better career recommendations"
    );
  }
  
  return recommendations;
};
