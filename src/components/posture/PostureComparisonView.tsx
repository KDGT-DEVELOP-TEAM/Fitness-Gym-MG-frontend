import React from 'react';
import { PostureComparison } from '../../types/posture';

interface PostureComparisonViewProps {
  comparison: PostureComparison;
}

export const PostureComparisonView: React.FC<PostureComparisonViewProps> = ({
  comparison,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Before</h3>
          <img
            src={comparison.before.imageUrl}
            alt="Before"
            className="w-full rounded"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">After</h3>
          <img
            src={comparison.after.imageUrl}
            alt="After"
            className="w-full rounded"
          />
        </div>
      </div>
      {comparison.improvements && comparison.improvements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">改善点</h3>
          <ul className="list-disc list-inside space-y-1">
            {comparison.improvements.map((improvement, index) => (
              <li key={index}>{improvement}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

