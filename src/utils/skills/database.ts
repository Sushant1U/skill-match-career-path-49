import { SkillsDatabase, CareerPaths } from './types';

// Skills mapped to industries and demand levels (1-10)
export const SKILLS_DATABASE: SkillsDatabase = {
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
  "algorithms": { industries: ["Software Engineering"], demand: 9 }
};

// Career paths with required skills
export const CAREER_PATHS: CareerPaths = {
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
