import React from 'react';
import { usePostures } from '../hooks/usePosture';
import { formatDate } from '../utils/dateFormatter';

export const PostureList: React.FC = () => {
  // const { postures, loading, error } = usePostures();

  // if (loading) return <div>読み込み中...</div>;
  // if (error) return <div>エラー: {error.message}</div>;

  return (
    <div></div>
    // <div>
    //   <h1 className="text-2xl font-bold mb-4">姿勢一覧</h1>
    //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    //     {postures.map((posture) => (
    //       <div key={posture.id} className="p-4 border rounded-lg">
    //         <img src={posture.imageUrl} alt="Posture" className="w-full h-48 object-cover rounded" />
    //         <p className="mt-2 text-sm text-gray-600">{formatDate(posture.createdAt)}</p>
    //       </div>
    //     ))}
    //   </div>
    // </div>
  );
};

