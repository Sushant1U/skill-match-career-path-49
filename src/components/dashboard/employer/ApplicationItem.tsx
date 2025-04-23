
import { Application, Student } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, X, Mail, FileText } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useState } from "react";
import { ResumePreviewDialog } from "@/components/dashboard/student/ResumePreviewDialog";
import { useNavigate } from "react-router-dom";

interface ApplicationItemProps {
  application: Application & {
    student?: Student;
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
  const navigate = useNavigate();
  
  console.log("ApplicationItem received:", application);
  console.log("Student data:", application.student);

  const handleContactStudent = () => {
    if (application.student?.email) {
      console.log("Contact student with email:", application.student.email);
      window.location.href = `mailto:${application.student.email}?subject=Regarding your job application`;
    } else {
      console.error("Unable to contact student. Email not available:", application.student);
      toast.error('Unable to contact student. Email not available.');
    }
  };

  const hasResume = Boolean(application.student?.resumeUrl || application.resumeUrl);
  const resumeUrl = application.student?.resumeUrl || application.resumeUrl || '';
  
  console.log("Has resume:", hasResume, "Resume URL:", resumeUrl);

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            {application.student?.name || "Anonymous Applicant"}
          </h3>
          <p className="text-gray-500 mb-3">{application.student?.location || "Unknown location"}</p>
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

      {application.student?.skills && application.student.skills.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Skills:</p>
          <div className="flex flex-wrap gap-1">
            {application.student.skills.slice(0, 5).map((skill, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                {skill}
              </span>
            ))}
            {application.student.skills.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                +{application.student.skills.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
        {hasResume ? (
          <Button 
            variant="link" 
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline p-0"
            onClick={() => setIsResumeDialogOpen(true)}
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
          onClick={handleContactStudent}
          disabled={!application.student?.email}
        >
          <Mail className="mr-2 h-4 w-4" />
          Contact
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
}
