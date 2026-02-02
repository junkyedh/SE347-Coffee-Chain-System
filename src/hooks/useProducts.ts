import { useEffect, useState } from "react";
import axios from "axios";
import { UnifiedApiRequest } from "@/services/UnifiedApiRequest";
import { Product } from "@/components/customer/CardProduct/CardProduct";

const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchProducts = async (retryCount = 0) => {
      if (!isMounted) return;
      
      setIsLoading(true);
      try {
        const res = await UnifiedApiRequest.get("/product/list", {
          signal: abortController.signal
        });

        if (!isMounted) return;

        const rawProducts = res.data?.data || res.data;
        if (!Array.isArray(rawProducts)) {
          console.error("Unexpected API format", res);
          return;
        }

        const mappedProducts: Product[] = rawProducts.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          image: item.image,
          available: item.available,
          sizes: Array.isArray(item.sizes)
            ? item.sizes.map((s: any) => ({
                name: s.sizeName,
                price: s.price,
              }))
            : [],
          hot: item.hot,
          cold: item.cold,
          materials: Array.isArray(item.materials)
            ? item.materials.map((m: any) => ({ name: m.name }))
            : [],
          description: item.description || "",
          isPopular: item.isPopular === true,
          rating: item.rating,
          totalRatings: item.totalRatings,
          discount: item.discount || 0,
        }));

        if (isMounted) {
          setProducts(mappedProducts);
        }
      } catch (error) {
        if (!isMounted) return;
        
        // Handle canceled requests gracefully
        if (axios.isCancel(error)) {
          console.debug('Product fetch was canceled');
          return;
        }
        
        console.error("Failed to fetch product list", error);
        
        // Retry logic for network errors
        const axiosError = error as any;
        if (retryCount < 2 && !axiosError.response) {
          console.log(`Retrying product fetch (${retryCount + 1}/2)`);
          setTimeout(() => {
            if (isMounted) {
              fetchProducts(retryCount + 1);
            }
          }, 1000 * (retryCount + 1));
          return;
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  return { products, isLoading };
};

export default useProducts;
