
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Copy } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResumeBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  resumeContent: string;
}

export function ResumeBuilder({ isOpen, onClose, resumeContent }: ResumeBuilderProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(resumeContent);
    toast.success("Resume content copied to clipboard");
  };
  
  const handleExportToPDF = async () => {
    if (!resumeContent) return;
    
    setIsExporting(true);
    try {
      const resumeElement = document.getElementById('resume-content');
      if (!resumeElement) return;
      
      const canvas = await html2canvas(resumeElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('my-professional-resume.pdf');
      toast.success("Resume exported as PDF successfully!");
    } catch (error) {
      console.error("Error exporting resume:", error);
      toast.error("Failed to export resume. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };
  
  const formattedContent = resumeContent.split('\n').map((line, index) => {
    // Check if line is a section header
    if (line.toUpperCase() === line && line.trim().length > 0) {
      return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-platformPurple">{line}</h2>;
    }
    // Check if line starts with a bullet point
    else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
      return <li key={index} className="ml-5 mb-1">{line.trim().substring(1).trim()}</li>;
    }
    // Empty lines as spacers
    else if (line.trim() === '') {
      return <div key={index} className="h-2"></div>;
    }
    // Regular text
    else {
      return <p key={index} className="mb-2">{line}</p>;
    }
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] bg-gradient-to-br from-white to-purple-50">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-platformPurple to-platformBlue bg-clip-text text-transparent">
            Your Professional Resume
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Your resume has been created based on your information. Export it as PDF or copy the text.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-3 mb-4">
          <Button 
            onClick={handleExportToPDF} 
            className="flex-1 bg-gradient-to-r from-platformPurple to-platformBlue hover:opacity-90"
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Generating PDF...' : 'Export as PDF'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCopyToClipboard}
            className="flex-1"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy to Clipboard
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-6 bg-white rounded-lg shadow-md border border-gray-100">
          <div id="resume-content" className="max-w-3xl mx-auto font-sans">
            {formattedContent}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
