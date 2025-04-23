import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import EmployerDashboard from "./pages/dashboard/EmployerDashboard";
import EmployerJobsPage from "./pages/employer/jobs";
import CandidatesPage from "./pages/employer/candidates";
import ApplicantsPage from "./pages/employer/applicants";
import ShortlistedApplicantsPage from "./pages/employer/shortlisted";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import JobsPage from "./pages/jobs";
import JobDetailsPage from "./pages/jobs/[id]";
import NewJob from "./pages/new-job";
import NotificationsPage from "./pages/notifications";
import ProfileEditPage from "./pages/profile/edit";
import SkillsAssessmentPage from "./pages/skills/assessment";
import MyApplicationsPage from "./pages/my-applications";
import RecommendedJobsPage from "./pages/jobs/recommended";
import { UserRole } from "./types";
import CareerAssistantPage from "./pages/career-assistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            
            {/* Student Routes */}
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skills/assessment"
              element={
                <ProtectedRoute allowedRole="student">
                  <SkillsAssessmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-applications"
              element={
                <ProtectedRoute allowedRole="student">
                  <MyApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/recommended"
              element={
                <ProtectedRoute allowedRole="student">
                  <RecommendedJobsPage />
                </ProtectedRoute>
              }
            />
            
            {/* Employer Routes */}
            <Route
              path="/employer-dashboard"
              element={
                <ProtectedRoute allowedRole="employer">
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/new-job"
              element={
                <ProtectedRoute allowedRole="employer">
                  <NewJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/jobs"
              element={
                <ProtectedRoute allowedRole="employer">
                  <EmployerJobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/candidates"
              element={
                <ProtectedRoute allowedRole="employer">
                  <CandidatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/applicants"
              element={
                <ProtectedRoute allowedRole="employer">
                  <ApplicantsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/shortlisted"
              element={
                <ProtectedRoute allowedRole="employer">
                  <ShortlistedApplicantsPage />
                </ProtectedRoute>
              }
            />
            
            {/* Shared Routes */}
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRole={["student", "employer"]}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute allowedRole={["student", "employer"]}>
                  <ProfileEditPage />
                </ProtectedRoute>
              }
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route
              path="/career-assistant"
              element={
                <ProtectedRoute allowedRole="student">
                  <CareerAssistantPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
