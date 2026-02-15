import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { RegistrationData, UserProfile, ManualPaymentConfig } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 30000, // 30 seconds
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useCompleteInitialProfileSetup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegistrationData) => {
      if (!actor) throw new Error('Actor not available');
      await actor.completeInitialProfileSetup(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSpinWheel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.spinWheel();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000, // 1 minute
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 300000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useGetHouseEdge() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['houseEdge'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getHouseEdgeValue();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000,
    refetchOnMount: false,
  });
}

export function useSetHouseEdge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setHouseEdgeValue(value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houseEdge'] });
    },
  });
}

export function useGetCreditPackages() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['creditPackages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCreditPackages();
    },
    enabled: !!actor && !isFetching,
    staleTime: 300000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useGetManualPaymentConfig() {
  const { actor, isFetching } = useActor();

  return useQuery<ManualPaymentConfig | null>({
    queryKey: ['manualPaymentConfig'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getManualPaymentConfig();
    },
    enabled: !!actor && !isFetching,
    staleTime: 300000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useSetManualPaymentConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: ManualPaymentConfig) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setManualPaymentConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manualPaymentConfig'] });
    },
  });
}

export function useCreateManualPaymentRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createManualPaymentRequest(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myManualPaymentRequests'] });
    },
  });
}

export function useGetManualPaymentRequest(requestId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['manualPaymentRequest', requestId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getManualPaymentRequest(requestId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 10000,
  });
}

export function useGetMyManualPaymentRequests() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['myManualPaymentRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyManualPaymentRequests();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useGetAllManualPaymentRequests() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allManualPaymentRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllManualPaymentRequests();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    refetchOnMount: false,
  });
}

export function useApproveManualPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.approveManualPayment(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allManualPaymentRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myManualPaymentRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

export function useDeclineManualPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.declineManualPayment(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allManualPaymentRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myManualPaymentRequests'] });
    },
  });
}

export function useAdminUpdateCredits() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, newBalance }: { user: Principal; newBalance: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminUpdateCredits(user, newBalance);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
