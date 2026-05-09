import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { OrderResponse } from "@/types";

export function useOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await api.get<OrderResponse[]>("/orders");
      return res.data;
    },
  });

  return { orders, isLoading };
}

export function useOrder(id: number) {
  const queryClient = useQueryClient();
  const { data: order, isLoading } = useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const res = await api.get<OrderResponse>(`/orders/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const confirmReceivedMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<OrderResponse>(`/orders/${id}/confirm-received`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
  });

  return {
    order,
    isLoading,
    confirmReceived: confirmReceivedMutation.mutateAsync,
    isConfirmingReceived: confirmReceivedMutation.isPending,
  };
}

export function useCheckout() {
  const queryClient = useQueryClient();

  const checkoutMutation = useMutation({
    mutationFn: async (data: { shipping_method: string; coupon_code?: string; address_id?: number }) => {
      const res = await api.post<OrderResponse>("/orders/checkout", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return { checkout: checkoutMutation.mutateAsync, isPending: checkoutMutation.isPending };
}
