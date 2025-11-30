import { useEffect, useState } from "react";
import { MainApiRequest } from "@/services/MainApiRequest";
import { Product } from "@/components/customer/CardProduct/CardProduct";

const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await MainApiRequest.get("/product/list");

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
          rating: item.rating || 0,
          discount: item.discount || 0,
        }));

        console.log("Mapped products:", mappedProducts);
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Error fetching product list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, isLoading };
};

export default useProducts;
