import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { CustomRequestDetailResponse, CustomRequestResponse } from "@/types";

export function useCustomRequests() {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["custom-requests"],
    queryFn: async () => {
      const res = await api.get<CustomRequestResponse[]>("/custom-requests");
      return res.data;
    },
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
  const queryClient = useQueryClient();

  const { data: request, isLoading } = useQuery({
    queryKey: ["custom-requests", id],
    queryFn: async () => {
      const res = await api.get<CustomRequestDetailResponse>(`/custom-requests/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await api.post(`/custom-requests/${id}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-requests", id] });
    },
  });

  return { request, isLoading, sendMessage: sendMessageMutation.mutateAsync };
}
