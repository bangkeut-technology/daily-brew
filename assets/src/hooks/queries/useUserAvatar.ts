import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { User } from '@/types';
import { useAuthenticationDispatch } from '@/hooks/use-authentication';

const AVATAR_URL = '/users/me/avatar';

/**
 * Avatar uploads ship as multipart/form-data so the server receives the
 * binary directly. We *unset* Content-Type on the request so axios lets the
 * browser write the multipart boundary itself — passing the JSON default
 * would corrupt the request body.
 *
 * On success we dispatch UPDATE_USER (instead of only invalidating React
 * Query) because the logged-in user lives in the authentication reducer,
 * not in a React Query cache entry. Skipping the dispatch leaves the nav /
 * profile header showing the old initials until the next full page load.
 */
export function useUploadUserAvatar() {
  const dispatch = useAuthenticationDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append('file', file);
      const { data } = await apiAxios.post<User>(AVATAR_URL, body, {
        headers: { 'Content-Type': undefined } as any,
      });
      return data;
    },
    onSuccess: (user) => {
      dispatch({ type: 'UPDATE_USER', user });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useRemoveUserAvatar() {
  const dispatch = useAuthenticationDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.delete<User>(AVATAR_URL);
      return data;
    },
    onSuccess: (user) => {
      dispatch({ type: 'UPDATE_USER', user });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
