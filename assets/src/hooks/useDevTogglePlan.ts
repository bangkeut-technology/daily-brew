import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/lib/apiAxios';
import { getWorkspacePublicId } from '@/lib/auth';

export function useDevTogglePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: 'free' | 'espresso' | 'double_espresso') => {
      const workspacePublicId = getWorkspacePublicId();
      const { data } = await axios.post('/dev/toggle-plan', { workspacePublicId, plan });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan'] });
    },
  });
}
