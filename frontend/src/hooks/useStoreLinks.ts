import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import { StoreLinksResponse } from "@/types";

export function useStoreLinks() {
  const { data: links, isLoading } = useQuery({
    queryKey: ["store-links"],
    queryFn: async () => {
      const res = await api.get<StoreLinksResponse>("/store/links");
      return res.data;
    },
  });

  return {
    links,
    isLoading,
  };
}
