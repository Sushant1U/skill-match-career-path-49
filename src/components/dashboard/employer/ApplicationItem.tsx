
import { Application, Student } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, X, Mail, FileText, User } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useState } from "react";
import { ResumePreviewDialog } from "@/components/dashboard/student/ResumePreviewDialog";

interface ApplicationItemProps {
  application: Application & {
    student?: Student | null;
    jobTitle?: string;
    jobCompany?: string;
  };
  onShortlist: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
}

export const ApplicationItem = ({
  application,
  onShortlist,
  onReject
}: ApplicationItemProps) => {
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  
  console.log("ApplicationItem received:", application);
  
  if (!application) {
    console.error("ApplicationItem received undefined application");
    return null;
  }
  
  const student = application.student;
  console.log("Student data:", student);

  const handleContactStudent = () => {
    if (student?.email) {
      console.log("Contact student with email:", student.email);
      window.open(`mailto:${student.email}?subject=Regarding your application for ${application.jobTitle}&body=Dear ${student.name},`, '_blank');
      toast.success('Opening email client...');
    } else {
      console.error("Unable to contact student. Email not available.");
      toast.error('Unable to contact student. Email not available.');
    }
  };

  const resumeUrl = application.resumeUrl || (student?.resumeUrl || null);
  const hasResume = Boolean(resumeUrl);
  
  console.log("Resume check - Has resume:", hasResume, "Resume URL:", resumeUrl);

  const studentName = student?.name || "Anonymous Applicant";
  const studentLocation = student?.location || "Unknown location";

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between">
        <div className="flex items-start">
          {student ? (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">
                {studentName}
              </h3>
              <p className="text-gray-500 mb-3">{studentLocation}</p>
            </div>
          ) : (
            <div className="flex items-center">
              <User className="h-10 w-10 text-gray-300 mr-3" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {studentName}
                </h3>
                <p className="text-gray-500 mb-3">{studentLocation}</p>
                <p className="text-xs text-amber-500">Student profile data unavailable</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="border-green-500 text-green-600 hover:bg-green-50"
            onClick={() => onShortlist(application.id)}
            disabled={application.status === 'shortlisted'}
          >
            <Check className="h-4 w-4 mr-1" />
            {application.status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50"
            onClick={() => onReject(application.id)}
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      </div>

      {application.jobTitle && (
        <div className="mt-3 bg-gray-50 p-3 rounded-md">
          <p className="text-sm font-medium">Applied for: {application.jobTitle}</p>
          <p className="text-sm text-gray-500">at {application.jobCompany}</p>
          <p className="text-xs text-gray-400 mt-1">
            Applied on: {new Date(application.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
        {hasResume ? (
          <Button 
            variant="link" 
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline p-0"
            onClick={() => {
              console.log("Opening resume dialog with URL:", resumeUrl);
              setIsResumeDialogOpen(true);
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            View Resume
          </Button>
        ) : (
          <span className="text-sm text-gray-400 flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            No resume available
          </span>
        )}
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleContactStudent}
          disabled={!student?.email}
          className="border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          <Mail className="mr-2 h-4 w-4" />
          Contact via Email
        </Button>
      </div>

      {hasResume && (
        <ResumePreviewDialog
          isOpen={isResumeDialogOpen}
          onClose={() => setIsResumeDialogOpen(false)}
          resumeUrl={resumeUrl}
        />
      )}
    </div>
  );
};
