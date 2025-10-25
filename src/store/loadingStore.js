// src/store/loadingStore.js
import { create } from "zustand";

const useLoadingStore = create((set) => ({
  isLoading: false,
  loadingText: "Cargando...",

  setLoading: (value) => set({ isLoading: value }),
  setLoadingText: (text) => set({ loadingText: text }),
}));

export default useLoadingStore;
