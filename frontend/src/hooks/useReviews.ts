import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ReviewResponse } from "@/types";

export function useReviews() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const res = await api.get<ReviewResponse[]>("/reviews");
      return res.data;
    },
  });

  return { reviews, isLoading };
}

export function useCreateReview(orderId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string; file?: File | null }) => {
      const formData = new FormData();
      formData.append("rating", String(data.rating));
      formData.append("comment", data.comment);
      if (data.file) {
        formData.append("file", data.file);
      }
      const res = await api.post<ReviewResponse>(`/reviews/orders/${orderId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
    },
  });

  return { createReview: mutation.mutateAsync, isCreatingReview: mutation.isPending };
}
