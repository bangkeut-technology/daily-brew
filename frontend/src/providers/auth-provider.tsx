"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiAxios, getWorkspacePublicId, clearWorkspacePublicId } from "@/lib/api";
import type { AuthState, User, Workspace } from "@/types/auth";

type AuthAction =
  | { type: "SIGN_IN"; user: User }
  | { type: "SET_WORKSPACE"; workspace: Workspace | undefined }
  | { type: "UPDATE_USER"; user: User }
  | { type: "SIGN_OUT" };

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SIGN_IN":
      return { ...state, status: "authenticated", user: action.user };
    case "UPDATE_USER":
      return { ...state, user: action.user };
    case "SET_WORKSPACE":
      return { ...state, workspace: action.workspace };
    case "SIGN_OUT":
      return { status: "unauthenticated", user: undefined, workspace: undefined };
    default:
      return state;
  }
}

const StateContext = React.createContext<AuthState>({
  status: "loading",
  user: undefined,
  workspace: undefined,
});
const DispatchContext = React.createContext<React.Dispatch<AuthAction>>(() => undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Unlike the legacy SPA there is no server-embedded user on the client shell,
  // so we always bootstrap by calling /users/me (which triggers the refresh
  // interceptor if the JWT has expired).
  const [state, dispatch] = React.useReducer(reducer, {
    status: "loading",
    user: undefined,
    workspace: undefined,
  });

  const { data: me, isSuccess, isError } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await apiAxios.get<User>("/users/me")).data,
    enabled: state.status === "loading",
    retry: false,
    staleTime: 0,
  });

  const { data: workspace } = useQuery({
    queryKey: ["my-current-workspace"],
    queryFn: async () =>
      (await apiAxios.get<Workspace | null>("/users/me/current-workspace")).data,
    enabled: state.status === "authenticated",
    retry: false,
  });

  React.useEffect(() => {
    if (isError) dispatch({ type: "SIGN_OUT" });
  }, [isError]);

  React.useEffect(() => {
    if (isSuccess && me) dispatch({ type: "SIGN_IN", user: me });
  }, [isSuccess, me]);

  // Server is authoritative for the current workspace; mirror into localStorage.
  React.useEffect(() => {
    if (workspace === undefined) return;
    if (workspace && workspace.publicId) {
      dispatch({ type: "SET_WORKSPACE", workspace });
      localStorage.setItem("workspace_public_id", workspace.publicId);
    } else {
      dispatch({ type: "SET_WORKSPACE", workspace: undefined });
      clearWorkspacePublicId();
    }
  }, [workspace]);

  // Restore workspace from the user record if localStorage is empty.
  React.useEffect(() => {
    if (
      state.status === "authenticated" &&
      state.user?.currentWorkspacePublicId &&
      !getWorkspacePublicId()
    ) {
      localStorage.setItem("workspace_public_id", state.user.currentWorkspacePublicId);
    }
  }, [state.status, state.user]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useAuth(): AuthState {
  return React.useContext(StateContext);
}

export function useAuthDispatch() {
  return React.useContext(DispatchContext);
}
