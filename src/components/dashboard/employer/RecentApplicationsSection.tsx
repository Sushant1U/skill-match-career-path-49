
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ApplicationCard } from "@/components/cards/ApplicationCard";
import { Spinner } from "@/components/ui/spinner";
import { Application, Student } from "@/types";
import { fetchApplicationsForEmployer, fetchStudentProfile } from "@/services/applications";
import { toast } from "@/components/ui/sonner";

export function RecentApplicationsSection() {
  const { data: applications = [], isLoading: isLoadingApplications } = useQuery({
    queryKey: ['employer-applications'],
    queryFn: async () => fetchApplicationsForEmployer(undefined, 5)
  });

  const { data: students = {}, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['application-students', applications],
    queryFn: async () => {
      const studentIds = applications.map(app => app.studentId);
      const uniqueIds = [...new Set(studentIds)];
      
      const studentsMap: Record<string, Student | null> = {};
      await Promise.all(
        uniqueIds.map(async (id) => {
          const student = await fetchStudentProfile(id);
          studentsMap[id] = student;
        })
      );
      return studentsMap;
    },
    enabled: applications.length > 0
  });

  const handleContactStudent = (studentId: string) => {
    const student = students[studentId];
    if (student) {
      toast.success(`Contact email sent to ${student.name} (${student.email})`);
    } else {
      toast.error('Unable to contact student. Student information not available.');
    }
  };

  return (
    <DashboardCard 
      title="Recent Applicants" 
      icon={<Users size={20} />}
      linkText="View All Candidates"
      linkUrl="/employer/applicants"
    >
      {isLoadingApplications || isLoadingStudents ? (
        <div className="py-6 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : applications.length === 0 ? (
        <div className="py-6 text-center text-gray-500">
          No applications received yet.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.slice(0, 3).map(application => (
            <ApplicationCard
              key={application.id}
              application={application}
              student={students[application.studentId]}
              onContact={handleContactStudent}
            />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
