import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { CustomRequestDetailResponse, CustomRequestResponse, ProductResponse } from "@/types";
import { useAuth } from "@/providers/auth-provider";

export function useCustomRequests() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";

  const { data: requests, isLoading } = useQuery({
    queryKey: [isAdmin ? "admin-custom-requests" : "custom-requests"],
    queryFn: async () => {
      const res = await api.get<CustomRequestResponse[]>(
        isAdmin ? "/admin/custom-requests" : "/custom-requests"
      );
      return res.data;
    },
    enabled: !authLoading && isAuthenticated,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: { subject: string; message: string }) => {
      const res = await api.post<CustomRequestDetailResponse>("/custom-requests", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-requests"] });
    },
  });

  return { requests, isLoading, createRequest: createRequestMutation.mutateAsync };
}

export function useCustomRequestDetails(id: number) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";
  const queryKey = [isAdmin ? "admin-custom-requests" : "custom-requests", id];

  const { data: request, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await api.get<CustomRequestDetailResponse>(
        isAdmin ? `/admin/custom-requests/${id}` : `/custom-requests/${id}`
      );
      return res.data;
    },
    enabled: !!id && !authLoading && isAuthenticated,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await api.post(
        isAdmin ? `/admin/custom-requests/${id}/messages` : `/custom-requests/${id}/messages`,
        { content }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/custom-requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["custom-requests"] });
    },
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; price: number }) => {
      const res = await api.post<ProductResponse>(
        `/admin/custom-requests/${id}/quote`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["admin-custom-requests"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    request,
    isLoading,
    sendMessage: sendMessageMutation.mutateAsync,
    cancelRequest: cancelMutation.mutateAsync,
    createQuote: createQuoteMutation.mutateAsync,
    isCreatingQuote: createQuoteMutation.isPending,
  };
}
