import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { styles as appShellStyles } from './components/app-shell';
import { CanvasPanel } from './components/canvas-panel';
import { Notification } from './components/notification';
import { Sidebar } from './components/sidebar';
import {
  PolygonEditorStoreProvider,
  usePolygonEditorStore,
} from './stores';

const AppContent = observer(function AppContent() {
  const editor = usePolygonEditorStore();

  useEffect(() => {
    // The provider creates one store instance for the app lifetime.
    // Connect once for that instance and disconnect on unmount.
    editor.connect();

    return () => {
      editor.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={appShellStyles.shell}
      onPointerDown={editor.clearError}
    >
      {editor.error && (
        <Notification message={editor.error} />
      )}

      <CanvasPanel />

      <Sidebar />
    </div>
  );
});

export default function App() {
  return (
    <PolygonEditorStoreProvider>
      <AppContent />
    </PolygonEditorStoreProvider>
  );
}
