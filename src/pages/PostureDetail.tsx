import React from 'react';
import { useParams } from 'react-router-dom';
import { usePosture } from '../hooks/usePosture';

export const PostureDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { posture, loading, error } = usePosture(id);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;
  if (!posture) return <div>姿勢データが見つかりません</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">姿勢詳細</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <img src={posture.imageUrl} alt="Posture" className="w-full max-w-2xl rounded" />
        {posture.analysis && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">分析結果</h2>
            {posture.analysis.recommendations && (
              <ul className="list-disc list-inside">
                {posture.analysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

