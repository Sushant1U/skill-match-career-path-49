
# Career Portal Platform

A modern career platform connecting students with employers, featuring AI-powered career guidance and job matching.

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for beautiful, accessible UI components
- **Tanstack Query** for efficient data fetching and caching
- **React Router** for client-side routing
- **Recharts** for data visualization
- **Lucide Icons** for modern iconography

### Backend (Supabase)
- **PostgreSQL** database
- **Row Level Security** for data protection
- **Edge Functions** for serverless computing
- **Real-time subscriptions** for live updates
- **Storage** for file uploads (resumes)
- **Authentication** with email/password

### AI Integration
- **OpenRouter API** with Meta's Llama 4 Scout model for career guidance
- Custom AI assistant (Sarthi) for personalized career advice

## 🏗️ Architecture

### Data Flow
1. **Authentication Flow**
   - Users sign up/login through Supabase Auth
   - User profiles are automatically created in the profiles table
   - Role-based access control (student/employer)

2. **Job Posting Flow**
   - Employers create job listings
   - Data stored in jobs table
   - Real-time updates for new postings

3. **Application Flow**
   - Students browse and apply to jobs
   - Applications stored with resume attachments
   - Automatic notifications for status updates

4. **AI Assistant Flow**
   - User messages processed through Edge Functions
   - OpenRouter API integration for AI responses
   - Context-aware career guidance

### Database Schema
- **profiles**: User information and roles
- **jobs**: Job listings and requirements
- **applications**: Job applications and status
- **notifications**: System notifications

## 🔐 Security

- Row Level Security (RLS) policies protect data access
- Secure file storage for resumes
- Environment variables for sensitive credentials
- API keys managed through Edge Functions

## 🎯 Key Features

1. **For Students**
   - AI-powered career guidance (Sarthi)
   - Skill assessment and recommendations
   - Job applications tracking
   - Resume management
   - Personalized job recommendations

2. **For Employers**
   - Job posting management
   - Applicant tracking
   - Candidate shortlisting
   - Company profile management
   - Application analytics

3. **Shared Features**
   - Real-time notifications
   - Profile management
   - Responsive design
   - Dark/light mode support

## 🚀 Getting Started

1. Clone the repository
```sh
git clone <YOUR_GIT_URL>
```

2. Install dependencies
```sh
npm install
```

3. Set up environment variables
```sh
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
OPENROUTER_API_KEY=your_openrouter_key
```

4. Start the development server
```sh
npm run dev
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px and above)
- Tablet (768px to 1023px)
- Mobile (below 768px)

## 🧪 Testing

- Jest for unit testing
- React Testing Library for component testing
- Type checking with TypeScript

## 📦 Deployment

The project can be deployed through Lovable's built-in deployment system:
1. Click on Share -> Publish in the Lovable interface
2. Optional: Connect a custom domain through Project Settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is MIT licensed.

