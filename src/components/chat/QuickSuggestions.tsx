
import { Button } from '@/components/ui/button';
import { FileText, Briefcase, Lightbulb } from 'lucide-react';

interface QuickSuggestionsProps {
  onSelect: (text: string) => void;
}

export function QuickSuggestions({ onSelect }: QuickSuggestionsProps) {
  const suggestions = [
    { text: "Help me build a resume", icon: <FileText className="h-3 w-3" /> },
    { text: "Show me job matches", icon: <Briefcase className="h-3 w-3" /> },
    { text: "Interview tips", icon: <Lightbulb className="h-3 w-3" /> }
  ];

  return (
    <div className="px-4 pb-2">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, i) => (
          <Button 
            key={i}
            variant="outline"
            size="sm"
            className="text-xs bg-white/80 hover:bg-platformPurple/5 border-purple-100"
            onClick={() => onSelect(suggestion.text)}
          >
            {suggestion.icon}
            <span className="ml-1">{suggestion.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
