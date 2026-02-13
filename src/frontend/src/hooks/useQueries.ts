import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, SpinResult } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    }
  });
}

export function useSpinWheel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<SpinResult, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.spinWheel();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });
}

export function useGetHouseEdge() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['houseEdge'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getHouseEdgeValue();
    },
    enabled: !!actor && !isFetching
  });
}

export function useSetHouseEdge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setHouseEdgeValue(value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houseEdge'] });
    }
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}

export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[any, bigint]>>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching
  });
}
