
import { Save, Check, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AnalysisResultsProps {
  result: any;
  onSave: () => void;
  isSaving: boolean;
}

export function AnalysisResults({ result, onSave, isSaving }: AnalysisResultsProps) {
  const renderScoreColor = (score: number) => {
    if (score < 40) return 'text-red-500';
    if (score < 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Your Skill Score</CardTitle>
        <CardDescription>Based on your skills and proficiency levels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32">
              <circle 
                cx="64" 
                cy="64" 
                r="60" 
                fill="none" 
                stroke="#e5e7eb" 
                strokeWidth="8" 
              />
              <circle 
                cx="64" 
                cy="64" 
                r="60" 
                fill="none" 
                stroke={result.score < 40 ? '#ef4444' : result.score < 70 ? '#f59e0b' : '#10b981'} 
                strokeWidth="8"
                strokeDasharray="376.8"
                strokeDashoffset={376.8 - (376.8 * result.score / 100)}
                transform="rotate(-90, 64, 64)"
              />
            </svg>
            <div className="absolute">
              <div className={`text-4xl font-bold ${renderScoreColor(result.score)}`}>
                {result.score}
              </div>
              <div className="text-gray-500 text-sm">out of 100</div>
            </div>
          </div>
        </div>
        
        {result.strengths.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-1" /> Strengths
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.strengths.map((strength: string) => (
                <Badge key={strength} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {result.weaknesses.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" /> Areas to Improve
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.weaknesses.map((weakness: string) => (
                <Badge key={weakness} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {weakness}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 text-platformBlue mr-1" /> Recommended Career Paths
          </h3>
          <ul className="space-y-2 text-sm">
            {result.recommendations.map((rec: string, index: number) => (
              <li key={index} className="text-gray-600">• {rec}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <Button 
            className="w-full" 
            onClick={onSave}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Assessment'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
