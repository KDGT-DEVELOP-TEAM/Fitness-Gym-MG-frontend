// src/hooks/useStore.ts
import { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';

export const useStores = () => {
  const [stores, setStores] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase.from('stores').select('id, name');
      if (data) setStores(data);
    };
    fetchStores();
  }, []);

  return { stores };
};