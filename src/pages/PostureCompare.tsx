import React, { useState } from 'react';
import { postureApi } from '../api/postureApi';
import { PostureComparison } from '../types/posture';
import { logger } from '../utils/logger';

export const PostureCompare: React.FC = () => {
  const [beforeId, setBeforeId] = useState('');
  const [afterId, setAfterId] = useState('');
  const [comparison, setComparison] = useState<PostureComparison | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!beforeId || !afterId) return;
    setLoading(true);
    try {
      const result = await postureApi.compare(beforeId, afterId);
      setComparison(result);
    } catch (error) {
      logger.error('Error comparing postures', error, 'PostureCompare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">姿勢比較</h1>
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Before ID</label>
          <input
            type="text"
            value={beforeId}
            onChange={(e) => setBeforeId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">After ID</label>
          <input
            type="text"
            value={afterId}
            onChange={(e) => setAfterId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </div>
        <button
          onClick={handleCompare}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {loading ? '比較中...' : '比較'}
        </button>
      </div>
      {comparison && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Before</h2>
            <img src={comparison.before.imageUrl} alt="Before" className="w-full rounded" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">After</h2>
            <img src={comparison.after.imageUrl} alt="After" className="w-full rounded" />
          </div>
          {comparison.improvements && (
            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-2">改善点</h3>
              <ul className="list-disc list-inside">
                {comparison.improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

