import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from 'react';

import { PolygonEditorStore } from './PolygonEditorStore';

const PolygonEditorStoreContext =
  createContext<PolygonEditorStore | null>(null);

type ProviderProps = {
  children: ReactNode;
};

export function PolygonEditorStoreProvider({
  children,
}: ProviderProps) {
  const store = useMemo(() => new PolygonEditorStore(), []);

  return (
    <PolygonEditorStoreContext.Provider value={store}>
      {children}
    </PolygonEditorStoreContext.Provider>
  );
}

export function usePolygonEditorStore() {
  const store = useContext(PolygonEditorStoreContext);

  if (!store) {
    throw new Error(
      'usePolygonEditorStore must be used inside PolygonEditorStoreProvider',
    );
  }

  return store;
}
