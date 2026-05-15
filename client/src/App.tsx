import { styles as appShellStyles } from './components/app-shell';
import { CanvasPanel } from './components/canvas-panel';
import { Notification } from './components/notification';
import { Sidebar } from './components/sidebar';

import { usePolygonEditor } from './hooks/usePolygonEditor';

export default function App() {
  const editor = usePolygonEditor();

  return (
    <div
      className={appShellStyles.shell}
      onPointerDown={editor.clearError}
    >
      {editor.error && (
        <Notification message={editor.error} />
      )}

      <CanvasPanel
        activePointCount={editor.activePointCount}
        activePolygonRef={editor.activePolygonRef}
        hoveredDeleteId={editor.hoveredDeleteId}
        isDrawing={editor.isDrawing}
        loading={editor.loading}
        polygons={editor.polygons}
        addPoint={editor.addPoint}
        clearEditedPolygon={editor.clearEditedPolygon}
        clearLoadedPolygons={editor.clearLoadedPolygons}
        finishPolygon={editor.finishPolygon}
        loadPolygons={editor.loadPolygons}
        startDrawing={editor.startDrawing}
      />

      <Sidebar
        polygons={editor.polygons}
        setHoveredDeleteId={editor.setHoveredDeleteId}
        removePolygon={editor.removePolygon}
      />
    </div>
  );
}
