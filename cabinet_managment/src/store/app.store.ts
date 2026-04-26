import { create } from 'zustand';

interface AppState {
  isPlansModalOpen: boolean;
  setPlansModalOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isPlansModalOpen: false,
  setPlansModalOpen: (isOpen) => set({ isPlansModalOpen: isOpen }),
}));
