import {create} from 'zustand';

export const useGlobalStore = create(set => ({
  showBottomBar: true,
  setShowBottomBar: show => set({showBottomBar: show}),
}));
