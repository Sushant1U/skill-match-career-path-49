// This utility contains the logic for the AI skill grading system

interface SkillAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

// Skills mapped to industries and demand levels (1-10)
const SKILLS_DATABASE = {
  // Programming languages
  "javascript": { industries: ["Web Development", "Software Engineering"], demand: 9 },
  "python": { industries: ["Data Science", "Machine Learning", "Backend"], demand: 10 },
  "java": { industries: ["Enterprise", "Android", "Backend"], demand: 8 },
  "c++": { industries: ["Game Development", "System Programming"], demand: 7 },
  "c#": { industries: ["Game Development", ".NET"], demand: 7 },
  "go": { industries: ["Backend", "Cloud"], demand: 8 },
  "ruby": { industries: ["Web Development"], demand: 6 },
  "php": { industries: ["Web Development"], demand: 6 },
  "swift": { industries: ["iOS Development"], demand: 7 },
  "kotlin": { industries: ["Android Development"], demand: 8 },
  "typescript": { industries: ["Web Development", "Frontend"], demand: 9 },
  "rust": { industries: ["System Programming", "Blockchain"], demand: 8 },
  "scala": { industries: ["Big Data"], demand: 7 },
  
  // Frameworks & Libraries
  "react": { industries: ["Frontend", "Web Development", "Mobile"], demand: 9 },
  "angular": { industries: ["Frontend", "Enterprise"], demand: 7 },
  "vue": { industries: ["Frontend", "Web Development"], demand: 8 },
  "django": { industries: ["Backend", "Web Development"], demand: 7 },
  "flask": { industries: ["Backend", "Web Development"], demand: 7 },
  "spring": { industries: ["Backend", "Enterprise"], demand: 8 },
  "node.js": { industries: ["Backend", "Web Development"], demand: 9 },
  "express": { industries: ["Backend", "Web Development"], demand: 8 },
  "laravel": { industries: ["Web Development", "Backend"], demand: 7 },
  "tensorflow": { industries: ["Machine Learning", "AI"], demand: 9 },
  "pytorch": { industries: ["Machine Learning", "AI"], demand: 9 },
  "pandas": { industries: ["Data Science", "Data Analysis"], demand: 8 },
  
  // Cloud & DevOps
  "aws": { industries: ["Cloud", "DevOps"], demand: 9 },
  "azure": { industries: ["Cloud", "Enterprise"], demand: 8 },
  "gcp": { industries: ["Cloud"], demand: 8 },
  "docker": { industries: ["DevOps", "Cloud"], demand: 9 },
  "kubernetes": { industries: ["DevOps", "Cloud"], demand: 9 },
  "ci/cd": { industries: ["DevOps"], demand: 8 },
  "terraform": { industries: ["Infrastructure", "DevOps"], demand: 8 },
  
  // Databases
  "sql": { industries: ["Database", "Backend"], demand: 9 },
  "mongodb": { industries: ["Database", "Backend"], demand: 8 },
  "postgresql": { industries: ["Database", "Backend"], demand: 8 },
  "mysql": { industries: ["Database", "Backend"], demand: 8 },
  "redis": { industries: ["Database", "Caching"], demand: 7 },
  
  // Design & UX
  "ui design": { industries: ["Design", "Frontend"], demand: 8 },
  "ux design": { industries: ["Design", "Product"], demand: 8 },
  "figma": { industries: ["Design"], demand: 8 },
  "sketch": { industries: ["Design"], demand: 7 },
  "adobe xd": { industries: ["Design"], demand: 7 },
  
  // Project Management
  "agile": { industries: ["Project Management"], demand: 8 },
  "scrum": { industries: ["Project Management"], demand: 8 },
  "jira": { industries: ["Project Management"], demand: 7 },
  
  // Soft Skills
  "communication": { industries: ["All"], demand: 9 },
  "teamwork": { industries: ["All"], demand: 9 },
  "problem solving": { industries: ["All"], demand: 9 },
  "critical thinking": { industries: ["All"], demand: 9 },
  "leadership": { industries: ["Management"], demand: 8 },
  
  // Other Technical Skills
  "git": { industries: ["Software Development"], demand: 9 },
  "rest api": { industries: ["Backend", "Web Development"], demand: 8 },
  "graphql": { industries: ["API", "Web Development"], demand: 7 },
  "responsive design": { industries: ["Frontend", "Web Development"], demand: 8 },
  "websockets": { industries: ["Web Development", "Real-time"], demand: 7 },
  "data structures": { industries: ["Software Engineering"], demand: 9 },
  "algorithms": { industries: ["Software Engineering"], demand: 9 },
};

// Career paths with required skills
const CAREER_PATHS = {
  "Frontend Developer": {
    primarySkills: ["javascript", "html", "css", "react", "typescript"],
    secondarySkills: ["responsive design", "git", "vue", "angular", "webpack"]
  },
  "Backend Developer": {
    primarySkills: ["node.js", "python", "java", "sql", "rest api"],
    secondarySkills: ["express", "django", "spring", "mongodb", "postgresql"]
  },
  "Full Stack Developer": {
    primarySkills: ["javascript", "html", "css", "node.js", "sql", "react"],
    secondarySkills: ["typescript", "mongodb", "git", "rest api", "express"]
  },
  "Data Scientist": {
    primarySkills: ["python", "statistics", "machine learning", "sql", "pandas"],
    secondarySkills: ["tensorflow", "pytorch", "r", "data visualization", "big data"]
  },
  "DevOps Engineer": {
    primarySkills: ["linux", "docker", "kubernetes", "ci/cd", "aws"],
    secondarySkills: ["terraform", "ansible", "jenkins", "monitoring", "automation"]
  },
  "UX/UI Designer": {
    primarySkills: ["ui design", "ux design", "figma", "adobe xd", "sketch"],
    secondarySkills: ["html", "css", "user research", "prototyping", "information architecture"]
  },
  "Mobile Developer": {
    primarySkills: ["swift", "kotlin", "react native", "flutter", "mobile design"],
    secondarySkills: ["rest api", "state management", "git", "firebase", "app store optimization"]
  },
  "Cloud Engineer": {
    primarySkills: ["aws", "azure", "gcp", "infrastructure as code", "networking"],
    secondarySkills: ["security", "monitoring", "cost optimization", "docker", "kubernetes"]
  }
};

/**
 * Calculate a score for each given skill based on demand and proficiency
 */
const analyzeSkillSet = (
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
  
  // Generate career path recommendations
  const recommendations = generateCareerRecommendations(normalizedSkills);
  
  return {
    score: normalizedScore,
    strengths,
    weaknesses,
    recommendations
  };
};

/**
 * Generate career recommendations based on skills
 */
const generateCareerRecommendations = (skills: string[]): string[] => {
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

export { analyzeSkillSet };
