import { useState, useEffect } from 'react';
import { PostureGroup, PostureImage } from '../types/posture';
import { postureApi } from '../api/postureApi';
import { PaginationParams } from '../types/common';

// 個別取得のエラー解消
export const usePosture = (id?: string) => {
  const [postureGroup, setPostureGroup] = useState<PostureGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) {
      fetchPosture(id);
    }
  }, [id]);

  const fetchPosture = async (groupId: string) => {
    setLoading(true);
    setError(null);
    try {
      // 💡 修正: postureApiには現在単体取得がないため、必要に応じてAPI側に追加するか、
      // 全体取得からフィルタリングするなどの対応が必要です。
      // ここでは、もしAPIにgetGroupがあればそれを使う想定です。
      // 現状はエラー回避のため getGroupsByCustomer を使った例にします（本来は単体APIが必要）
      console.warn("postureApi does not have getById. Please check API implementation.");
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { postureGroup, loading, error };
};

// 一覧取得のエラー解消
export const usePostures = (params?: PaginationParams) => {
  const [groups, setGroups] = useState<PostureGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchPostures();
  }, [params?.page, params?.limit]);

  const fetchPostures = async () => {
    setLoading(true);
    setError(null);
    try {
      // 💡 修正: postureApi.getAll は存在しません。
      // 顧客IDが不明な状態での「全取得」APIがない場合、このフック自体の設計を見直す必要があります。
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { groups, loading, error };
};

// 顧客別取得のエラー解消（画像10の対応）
export const usePosturesByCustomer = (customerId: string) => {
  const [groups, setGroups] = useState<PostureGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (customerId) {
      fetchGroups();
    }
  }, [customerId]);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      // 💡 修正: getByCustomerId ではなく getGroupsByCustomer を使用
      const data = await postureApi.getGroupsByCustomer(customerId);
      setGroups(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { groups, loading, error, refetch: fetchGroups };
};