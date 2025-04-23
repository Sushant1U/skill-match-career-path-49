
import { describe, it, expect } from '@jest/globals';
import { analyzeSkillSet } from '../analyzer';

describe('Skill Analyzer', () => {
  it('should provide complete analysis for valid skills', () => {
    const skills = ['javascript', 'python', 'react'];
    const proficiency = { javascript: 8, python: 9, react: 7 };
    
    const result = analyzeSkillSet(skills, proficiency);
    
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.strengths)).toBe(true);
    expect(Array.isArray(result.weaknesses)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it('should handle empty skill set', () => {
    const result = analyzeSkillSet([]);
    
    expect(result.score).toBe(30);
    expect(result.strengths).toHaveLength(0);
    expect(result.weaknesses).toHaveLength(0);
    expect(result.recommendations).toHaveLength(3);
  });

  it('should normalize skills to lowercase', () => {
    const skills = ['JavaScript', 'Python', 'React'];
    const result = analyzeSkillSet(skills);
    
    expect(result.score).toBeGreaterThan(0);
  });

  it('should handle unknown skills gracefully', () => {
    const skills = ['unknown-skill-1', 'unknown-skill-2'];
    const result = analyzeSkillSet(skills);
    
    expect(result.score).toBe(30);
    expect(result.strengths).toHaveLength(0);
    expect(result.weaknesses).toHaveLength(0);
    expect(result.recommendations).toContain('Add more specific technical skills to your profile');
  });
});
