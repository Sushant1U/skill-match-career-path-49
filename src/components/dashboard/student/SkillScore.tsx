
import React from 'react';
import { Award, Check, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SkillScoreProps {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations?: string[];
  isLoading?: boolean;
}

export function SkillScore({ 
  score, 
  strengths = [], 
  weaknesses = [], 
  recommendations = [],
  isLoading = false
}: SkillScoreProps) {
  
  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-red-500';
    if (score < 70) return 'text-amber-500';
    return 'text-green-500';
  };

  const getScoreRingColor = (score: number) => {
    if (score < 40) return '#ef4444';
    if (score < 70) return '#f59e0b';
    return '#10b981';
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 mb-2">
          <svg className="w-24 h-24" viewBox="0 0 100 100">
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#e5e7eb" 
              strokeWidth="8" 
            />
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke={getScoreRingColor(score)}
              strokeWidth="8"
              strokeDasharray="282.7"
              strokeDashoffset={282.7 - (282.7 * score / 100)}
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
            <div className="text-xs text-gray-500">score</div>
          </div>
        </div>
        <div className="flex items-center">
          <Award size={16} className={`${getScoreColor(score)} mr-1`} />
          <span className="text-sm font-medium">
            {score < 40 ? 'Beginner' : score < 70 ? 'Intermediate' : 'Advanced'}
          </span>
        </div>
      </div>

      {strengths.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-1" /> Strengths
          </h3>
          <div className="flex flex-wrap gap-1">
            {strengths.slice(0, 3).map((strength, idx) => (
              <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {strength}
              </Badge>
            ))}
            {strengths.length > 3 && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                +{strengths.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {weaknesses.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" /> Improve
          </h3>
          <div className="flex flex-wrap gap-1">
            {weaknesses.slice(0, 2).map((weakness, idx) => (
              <Badge key={idx} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {weakness}
              </Badge>
            ))}
            {weaknesses.length > 2 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                +{weaknesses.length - 2} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
