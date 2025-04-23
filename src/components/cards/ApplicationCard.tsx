
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Application, Student } from '@/types';
import { Spinner } from '@/components/ui/spinner';
import { Mail, Eye } from 'lucide-react';

interface ApplicationCardProps {
  application: Application;
  student: Student | null;
  isLoading?: boolean;
  onContact?: (studentId: string) => void;
  jobTitle?: string;
  jobCompany?: string;
}

export function ApplicationCard({ 
  application, 
  student, 
  isLoading = false,
  onContact,
  jobTitle,
  jobCompany
}: ApplicationCardProps) {
  
  if (isLoading) {
    return (
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <p className="text-gray-500 text-center">Application information not available</p>
      </div>
    );
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'contacted':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-1">{student.name}</h3>
          <p className="text-gray-500 mb-3">{student.location}</p>
        </div>
        <Badge variant={getBadgeVariant(application.status)}>
          {application.status}
        </Badge>
      </div>

      {(jobTitle && jobCompany) && (
        <div className="mb-4 bg-gray-50 p-2 rounded-md">
          <p className="text-sm text-gray-500">Applied for:</p>
          <p className="text-sm font-medium">{jobTitle}</p>
          <p className="text-sm text-gray-500">{jobCompany}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {student.resumeUrl ? (
          <a 
            href={student.resumeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium text-platformBlue hover:text-platformBlue-dark"
          >
            Download Resume
          </a>
        ) : (
          <span className="text-sm text-gray-500">No resume available</span>
        )}

        <div className="flex space-x-2">
          <Link to={`/students/${student.id}`}>
            <Button size="sm" variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </Button>
          </Link>
          <Button 
            size="sm" 
            onClick={() => onContact && onContact(student.id)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Contact
          </Button>
        </div>
      </div>
    </div>
  );
}
