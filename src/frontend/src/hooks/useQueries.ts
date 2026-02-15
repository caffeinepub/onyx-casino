import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, ManualPaymentRequest, Transaction, SpinResult, RegistrationData } from '../backend';
import { Principal } from '@dfinity/principal';

// Optimized staleTime and refetch policies
const STALE_TIME = 30000; // 30 seconds
const REFETCH_INTERVAL = false; // Disable automatic refetching

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
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Return custom state that properly reflects actor dependency
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useCompleteInitialProfileSetup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { displayName: string; dateOfBirth: string; referrer?: Principal }>({
    mutationFn: async ({ displayName, dateOfBirth, referrer }) => {
      if (!actor) throw new Error('Actor not available');
      const registrationData: RegistrationData = {
        displayName,
        dateOfBirth,
        referrer,
        couponCode: undefined,
      };
      return actor.completeInitialProfileSetup(registrationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[Principal, bigint]>>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useGetMyCreditTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['myTransactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyCreditTransactions();
    },
    enabled: !!actor && !isFetching,
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useGetCreditPackages() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<{ name: string; credits: bigint; priceInrMultiplier: bigint }>>({
    queryKey: ['creditPackages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCreditPackages();
    },
    enabled: !!actor && !isFetching,
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
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
    onSuccess: (result) => {
      // Immediately update the cached profile with the new balance and last spin result
      queryClient.setQueryData(['currentUserProfile'], (old: UserProfile | null | undefined) => {
        if (!old) return old;
        return {
          ...old,
          credits: result.balanceAfterSpin,
          lastSpinResult: result,
        };
      });
      
      // Invalidate to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['myTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

export function useCreateManualPaymentRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<bigint, Error, bigint>({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createManualPaymentRequest(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myManualPaymentRequests'] });
    },
  });
}

export function useGetMyManualPaymentRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<ManualPaymentRequest[]>({
    queryKey: ['myManualPaymentRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyManualPaymentRequests();
    },
    enabled: !!actor && !isFetching,
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useGetManualPaymentRequest(requestId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<ManualPaymentRequest | null>({
    queryKey: ['manualPaymentRequest', requestId.toString()],
    queryFn: async () => {
      if (!actor || requestId === BigInt(0)) return null;
      try {
        return await actor.getManualPaymentRequest(requestId);
      } catch (error) {
        console.error('Failed to fetch payment request:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && requestId !== BigInt(0),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useGetManualPaymentConfig() {
  const { actor, isFetching } = useActor();

  return useQuery<{ qrImageReference: string; instructions: string } | null>({
    queryKey: ['manualPaymentConfig'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getManualPaymentConfig();
    },
    enabled: !!actor && !isFetching,
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
}

// Stripe hooks
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { secretKey: string; allowedCountries: string[] }>({
    mutationFn: async (config) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
    },
  });
}

// Admin hooks
export function useGetAllManualPaymentRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<ManualPaymentRequest[]>({
    queryKey: ['allManualPaymentRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllManualPaymentRequests();
    },
    enabled: !!actor && !isFetching,
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useApproveManualPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveManualPayment(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allManualPaymentRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myManualPaymentRequests'] });
    },
  });
}

export function useDeclineManualPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.declineManualPayment(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allManualPaymentRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myManualPaymentRequests'] });
    },
  });
}

export function useSetManualPaymentConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { qrImageReference: string; instructions: string }>({
    mutationFn: async (config) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setManualPaymentConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manualPaymentConfig'] });
    },
  });
}

export function useGetHouseEdgeValue() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['houseEdge'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getHouseEdgeValue();
    },
    enabled: !!actor && !isFetching,
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useSetHouseEdgeValue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (value: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setHouseEdgeValue(value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houseEdge'] });
    },
  });
}

export function useAdminUpdateCredits() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<bigint, Error, { user: Principal; newBalance: bigint }>({
    mutationFn: async ({ user, newBalance }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminUpdateCredits(user, newBalance);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
