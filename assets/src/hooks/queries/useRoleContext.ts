import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { RoleContext } from '@/types';

export function useRoleContext() {
  return useQuery({
    queryKey: ['role-context'],
    queryFn: async () => {
      const { data } = await apiAxios.get<RoleContext>('/users/me/role-context');
      return data;
    },
  });
}

export function useLinkEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employeePublicId: string) => {
      const { data } = await apiAxios.post('/users/me/link-employee', { employeePublicId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-context'] });
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post('/users/me/complete-onboarding');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-context'] });
    },
  });
}
