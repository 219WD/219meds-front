// useProductStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import useAuthStore from "./authStore";
import { API_URL } from "../common/constants";

const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      filteredProducts: [],
      loading: false,
      error: null,

      fetchProducts: async () => {
        set({ loading: true });
        try {
          const res = await fetch(`${API_URL}/products/getProducts`, {
            headers: {
              Authorization: `Bearer ${useAuthStore.getState().token}`,
            },
          });
          if (!res.ok) throw new Error("Error al obtener productos");
          const data = await res.json();

          const filteredProducts = data.filter(product =>
            product.isActive && product.stock > 0
          );

          set({ products: data, filteredProducts, error: null });
        } catch (err) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      fetchAllProductsForAdmin: async () => {
        set({ loading: true });
        try {
          const res = await fetch(`${API_URL}/products/getProducts`, {
            headers: {
              Authorization: `Bearer ${useAuthStore.getState().token}`,
            },
          });
          if (!res.ok) throw new Error("Error al obtener productos");
          const data = await res.json();
          set({ products: data, filteredProducts: data, error: null });
        } catch (err) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      fetchProductById: async (id) => {
        try {
          const res = await fetch(`${API_URL}/products/getProducts/${id}`, {
            headers: {
              Authorization: `Bearer ${useAuthStore.getState().token}`,
            },
          });
          if (!res.ok) throw new Error("Error al obtener producto");
          return await res.json();
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      createProduct: async (newProduct) => {
        const { token } = useAuthStore.getState();
        try {
          if (newProduct.stock === 0) {
            newProduct.isActive = false;
          }

          const res = await fetch(`${API_URL}/products/createProduct`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newProduct),
          });
          if (!res.ok) throw new Error("Error al crear producto");
          const created = await res.json();

          set((state) => ({
            products: [created, ...state.products],
            filteredProducts: created.isActive && created.stock > 0
              ? [created, ...state.filteredProducts]
              : state.filteredProducts
          }));
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      updateProduct: async (id, updatedData) => {
        const { token } = useAuthStore.getState();
        try {
          if (updatedData.stock === 0) {
            updatedData.isActive = false;
          }

          const res = await fetch(`${API_URL}/products/updateProduct/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
          });
          if (!res.ok) throw new Error("Error al actualizar producto");
          const updated = await res.json();

          set((state) => ({
            products: state.products.map((p) =>
              p._id === id ? updated : p
            ),
            filteredProducts: updated.isActive && updated.stock > 0
              ? state.filteredProducts.map(p => p._id === id ? updated : p)
              : state.filteredProducts.filter(p => p._id !== id)
          }));
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      // Descomentar y ajustar updateLocalStock
      updateLocalStock: (productId, quantity) => {
        set((state) => {
          const updatedProducts = state.products.map((product) =>
            product._id === productId
              ? { ...product, stock: Math.max(0, product.stock - quantity) }
              : product
          );

          const updatedFilteredProducts = updatedProducts.filter(product =>
            product.isActive && product.stock > 0
          );

          return {
            products: updatedProducts,
            filteredProducts: updatedFilteredProducts
          };
        });
      },

      // Descomentar y ajustar restoreLocalStock
      restoreLocalStock: (productId, quantity) => {
        set((state) => {
          const updatedProducts = state.products.map((product) =>
            product._id === productId
              ? { ...product, stock: (product.stock || 0) + quantity }
              : product
          );

          const updatedFilteredProducts = updatedProducts.filter(product =>
            product.isActive && product.stock > 0
          );

          return {
            products: updatedProducts,
            filteredProducts: updatedFilteredProducts
          };
        });
      },

      toggleStatus: async (id) => {
        const { token, products } = get();
        const product = products.find(p => p._id === id);

        if (!product.isActive && product.stock === 0) {
          throw new Error("No se puede activar un producto sin stock");
        }

        try {
          const res = await fetch(`${API_URL}/products/toggle-status/${id}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) throw new Error("Error al cambiar estado");
          const { product: updatedProduct } = await res.json();

          set((state) => ({
            products: state.products.map((p) =>
              p._id === id ? updatedProduct : p
            ),
            filteredProducts: updatedProduct.isActive && updatedProduct.stock > 0
              ? state.filteredProducts.map(p => p._id === id ? updatedProduct : p)
              : state.filteredProducts.filter(p => p._id !== id)
          }));
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      deleteProduct: async (id) => {
        const { token } = useAuthStore.getState();
        try {
          const res = await fetch(`${API_URL}/products/deleteProduct/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) throw new Error("Error al eliminar producto");
          set((state) => ({
            products: state.products.filter((p) => p._id !== id),
            filteredProducts: state.filteredProducts.filter((p) => p._id !== id),
          }));
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      updateProductRating: (productId, rating, numReviews) => {
        set((state) => ({
          products: state.products.map((p) =>
            p._id === productId ? { ...p, rating, numReviews } : p
          ),
          filteredProducts: state.filteredProducts.map((p) =>
            p._id === productId ? { ...p, rating, numReviews } : p
          ),
        }));
      },

      getActiveProducts: () => {
        const { filteredProducts } = get();
        return filteredProducts || [];
      },

      forceRefresh: async () => {
        await get().fetchProducts();
      },

      getProductStock: (productId) => {
        const { products } = get();
        const product = products.find(p => p._id === productId);
        return product ? product.stock : 0;
      },

      checkStockAvailability: (productId, requestedQuantity) => {
        const { products } = get();
        const product = products.find(p => p._id === productId);
        return product && product.stock >= requestedQuantity;
      },

      restoreStock: async (productId, quantity) => {
        const { token } = useAuthStore.getState();
        try {
          const res = await fetch(`${API_URL}/products/${productId}/restore-stock`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity }),
          });

          if (!res.ok) throw new Error("Error al restaurar stock");

          await get().fetchProducts();

          return true;
        } catch (err) {
          console.error("Error restaurando stock:", err);
          return false;
        }
      },

      getProductById: (id) => {
        const { products } = get();
        return products.find(p => p._id === id);
      },

      searchProducts: (searchTerm) => {
        const { filteredProducts } = get();
        if (!searchTerm) return filteredProducts;

        return filteredProducts.filter(product =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      },

      getProductsByCategory: (category) => {
        const { filteredProducts } = get();
        if (!category) return filteredProducts;

        return filteredProducts.filter(product =>
          product.category.toLowerCase() === category.toLowerCase()
        );
      },

      getUniqueCategories: () => {
        const { filteredProducts } = get();
        const categories = filteredProducts.map(product => product.category);
        return [...new Set(categories)].filter(category => category);
      }
    }),
    {
      name: "products-storage",
      partialize: (state) => ({
        products: state.products,
        filteredProducts: state.filteredProducts
      })
    }
  )
);

export default useProductStore;