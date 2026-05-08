import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { ProductResponse } from "@/types";

export function useProducts() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get<ProductResponse[]>("/products");
      return res.data;
    },
  });

  return { products, isLoading, error };
}

export function useProduct(id: number) {
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const res = await api.get<ProductResponse>(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  return { product, isLoading, error };
}
