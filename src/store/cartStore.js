import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useAuthStore from './authStore';
import API_URL from '../common/constants';

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      cartId: null,
      isCartVisible: false,
      loading: false,
      error: null,

      fetchCart: async () => {
        const { token, user } = useAuthStore.getState();
        if (!token || !user?._id) {
          set({ cart: [], cartId: null });
          return;
        }

        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/cart/user/${user._id}/last`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            // Si el carrito no existe, no es un error
            if (res.status === 404) {
              set({ cart: [], cartId: null, loading: false });
              return;
            }
            throw new Error('Error al obtener carrito');
          }

          const data = await res.json();

          if (data && ['inicializado', 'pendiente', 'pagado', 'preparacion', 'entregado', 'cancelado'].includes(data.status)) {
            set({
              cart: data.items.map(item => ({
                id: item.productId._id || item.productId,
                ...item.productId,
                quantity: item.quantity
              })),
              cartId: {
                id: data._id,
                status: data.status,
                paymentMethod: data.paymentMethod,
                deliveryMethod: data.deliveryMethod,
                shippingAddress: data.shippingAddress,
              }
            });

            if (['entregado', 'cancelado'].includes(data.status)) {
              set({ cart: [], cartId: null });
            }
          } else {
            set({ cart: [], cartId: null });
          }
        } catch (err) {
          console.error('Error en fetchCart:', err);
          set({ error: err.message, cart: [], cartId: null });
        } finally {
          set({ loading: false });
        }
      },

      addToCart: async (product, extraData = {}) => {
        const { token, user } = useAuthStore.getState();
        const { cartId, fetchCart } = get();

        if (!token || !user || !user._id) {
          throw new Error("Debes iniciar sesión para agregar productos al carrito");
        }

        const productId = product._id || product.id;
        if (!productId) {
          throw new Error("El producto no tiene un ID válido");
        }

        // Verificar si el producto está activo y tiene stock
        if (!product.isActive) {
          throw new Error("Este producto no está disponible");
        }

        if (product.stock <= 0) {
          throw new Error("Este producto no tiene stock disponible");
        }

        set({ loading: true, error: null });

        try {
          const usarNuevoCarrito = !cartId || ['pagado', 'preparacion', 'cancelado', 'entregado'].includes(cartId?.status);

          const item = {
            productId,
            quantity: 1,
          };

          const url = usarNuevoCarrito
            ? `${API_URL}/cart/addToCart`
            : `${API_URL}/cart/update/${cartId.id}`;

          const method = usarNuevoCarrito ? "POST" : "PUT";

          const body = usarNuevoCarrito
            ? {
                userId: user._id,
                items: [item],
                paymentMethod: extraData.paymentMethod || "efectivo",
                deliveryMethod: extraData.deliveryMethod || "retiro",
                shippingAddress: extraData.shippingAddress || {
                  name: user.name,
                  address: "Sin dirección",
                  phone: "0000000000",
                },
                totalAmount: product.price,
              }
            : { ...item, action: "add" };

          const response = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          });

          const responseData = await response.json();
          
          if (!response.ok) {
            throw new Error(responseData.message || responseData.error || "Error al agregar al carrito");
          }

          // Actualizar el carrito después de agregar el producto
          await fetchCart();
          
          return responseData;
        } catch (error) {
          console.error("Error detallado en addToCart:", error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateQuantity: async (productId, increment) => {
        const { token } = useAuthStore.getState();
        const { cartId, fetchCart } = get();
        
        if (!token || !cartId || ['pagado', 'preparacion', 'entregado', 'cancelado'].includes(cartId.status)) {
          throw new Error("No se puede modificar el carrito actual");
        }

        set({ loading: true, error: null });
        try {
          const action = increment > 0 ? 'add' : 'subtract';
          const res = await fetch(`${API_URL}/cart/update/${cartId.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId, action }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Error al actualizar cantidad');
          }

          await fetchCart();
        } catch (err) {
          console.error('Error en updateQuantity:', err);
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      removeFromCart: async (productId) => {
        const { token } = useAuthStore.getState();
        const { cartId, fetchCart } = get();
        
        if (!token || !cartId || ['pagado', 'preparacion', 'cancelado', 'entregado'].includes(cartId.status)) {
          throw new Error("No se puede modificar el carrito actual");
        }

        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/cart/update/${cartId.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId, action: 'remove' }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Error al eliminar producto');
          }

          await fetchCart();
        } catch (err) {
          console.error('Error en removeFromCart:', err);
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      checkoutCart: async (data) => {
        const { token } = useAuthStore.getState();
        const { cartId, fetchCart } = get();

        if (!token || !cartId || ['entregado', 'cancelado'].includes(cartId.status)) {
          throw new Error("No se puede finalizar este carrito");
        }

        set({ loading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/cart/checkout/${cartId.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const resData = await response.json();
            throw new Error(resData.message || "Error al finalizar compra");
          }

          await fetchCart();
          return await response.json();
        } catch (error) {
          console.error('Error en checkoutCart:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      toggleCartVisibility: () =>
        set((state) => ({ isCartVisible: !state.isCartVisible })),

      clearCart: () => {
        set({ cart: [], cartId: null, isCartVisible: false, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        isCartVisible: state.isCartVisible,
        cart: state.cart,
        cartId: state.cartId,
      }),
      onRehydrateStorage: () => (state) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          state?.clearCart?.();
        }
      },
    }
  )
);

export default useCartStore;