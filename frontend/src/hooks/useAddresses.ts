import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { AddressResponse } from "@/types";
import { useAuth } from "@/providers/auth-provider";

export interface AddressPayload {
  label: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default?: boolean;
}

export function useAddresses() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await api.get<AddressResponse[]>("/users/me/addresses");
      return res.data;
    },
    enabled: !authLoading && isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: async (data: AddressPayload) => {
      const res = await api.post<AddressResponse>("/users/me/addresses", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (addressId: number) => {
      const res = await api.put<AddressResponse>(`/users/me/addresses/${addressId}/default`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (addressId: number) => {
      await api.delete(`/users/me/addresses/${addressId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  return {
    addresses,
    isLoading,
    createAddress: createMutation.mutateAsync,
    setDefaultAddress: setDefaultMutation.mutateAsync,
    deleteAddress: deleteMutation.mutateAsync,
  };
}
