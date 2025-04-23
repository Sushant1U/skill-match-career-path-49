
import { describe, it, expect } from '@jest/globals';
import { identifyStrengthsAndWeaknesses } from '../skill-evaluator';

describe('Skill Evaluator', () => {
  it('should identify strengths correctly', () => {
    const skills = ['javascript', 'python'];
    const proficiency = { javascript: 8, python: 9 };
    
    const result = identifyStrengthsAndWeaknesses(skills, proficiency);
    
    expect(result.strengths).toContain('javascript');
    expect(result.strengths).toContain('python');
    expect(result.weaknesses).toHaveLength(0);
  });

  it('should identify weaknesses correctly', () => {
    const skills = ['javascript', 'python'];
    const proficiency = { javascript: 3, python: 2 };
    
    const result = identifyStrengthsAndWeaknesses(skills, proficiency);
    
    expect(result.weaknesses).toContain('javascript');
    expect(result.weaknesses).toContain('python');
    expect(result.strengths).toHaveLength(0);
  });

  it('should handle unknown skills', () => {
    const skills = ['unknown-skill'];
    const result = identifyStrengthsAndWeaknesses(skills);
    
    expect(result.strengths).toHaveLength(0);
    expect(result.weaknesses).toHaveLength(0);
  });

  it('should use default proficiency when not provided', () => {
    const skills = ['javascript'];
    const result = identifyStrengthsAndWeaknesses(skills);
    
    // Default proficiency is 5, which is not high enough for strength
    // but not low enough for weakness
    expect(result.strengths).toHaveLength(0);
    expect(result.weaknesses).toHaveLength(0);
  });
});
