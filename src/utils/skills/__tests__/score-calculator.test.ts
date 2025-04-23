
import { calculateSkillScore, normalizeScore } from '../score-calculator';
import { SKILLS_DATABASE } from '../database';

describe('Score Calculator', () => {
  describe('calculateSkillScore', () => {
    it('should calculate correct score for matched skills', () => {
      const skills = ['javascript', 'python'];
      const proficiency = { javascript: 8, python: 9 };
      
      const result = calculateSkillScore(skills, proficiency);
      
      expect(result.matchedSkillsCount).toBe(2);
      expect(result.totalScore).toBe(
        (SKILLS_DATABASE.javascript.demand * 8) / 10 +
        (SKILLS_DATABASE.python.demand * 9) / 10
      );
      expect(result.maxPossibleScore).toBe(20);
      expect(result.uniqueIndustries.size).toBeGreaterThan(0);
    });

    it('should handle unknown skills', () => {
      const skills = ['unknown-skill', 'javascript'];
      const result = calculateSkillScore(skills);
      
      expect(result.matchedSkillsCount).toBe(1);
      expect(result.totalScore).toBe((SKILLS_DATABASE.javascript.demand * 5) / 10);
    });

    it('should use default proficiency of 5 when not provided', () => {
      const skills = ['javascript'];
      const result = calculateSkillScore(skills);
      
      expect(result.totalScore).toBe((SKILLS_DATABASE.javascript.demand * 5) / 10);
    });
  });

  describe('normalizeScore', () => {
    it('should normalize score correctly', () => {
      const scoreResult = {
        totalScore: 15,
        maxPossibleScore: 20,
        matchedSkillsCount: 2,
        uniqueIndustries: new Set(['Web Development', 'Frontend'])
      };
      
      const normalizedScore = normalizeScore(scoreResult);
      // (15/20 * 100) + min(2 industries * 2, 20) = 75 + 4 = 79
      expect(normalizedScore).toBe(79);
    });

    it('should cap normalized score at 100', () => {
      const scoreResult = {
        totalScore: 20,
        maxPossibleScore: 20,
        matchedSkillsCount: 2,
        uniqueIndustries: new Set(['Web Development', 'Frontend', 'Backend', 
          'Cloud', 'DevOps', 'Mobile', 'AI', 'Database', 'Security', 'Design'])
      };
      
      const normalizedScore = normalizeScore(scoreResult);
      expect(normalizedScore).toBe(100);
    });
  });
});

