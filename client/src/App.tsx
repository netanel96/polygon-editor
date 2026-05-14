import { PolygonCanvas } from './components/PolygonCanvas';
import { PolygonList } from './components/PolygonList';
import { Toolbar } from './components/Toolbar';

import { usePolygonEditor } from './hooks/usePolygonEditor';

export default function App() {
  const editor = usePolygonEditor();

  return (
    <div
      className="app-shell"
      onPointerDown={editor.clearError}
    >
      {editor.error && (
        <div className="notification" role="alert">
          {editor.error}
        </div>
      )}

      <div className="canvas-panel">
        <div className="panel-header">
          <h1>Polygon Editor</h1>
        </div>

        <Toolbar
          isDrawing={editor.isDrawing}
          loading={editor.loading}
          onFinish={editor.finishPolygon}
          onLoad={editor.loadPolygons}
        />

        <PolygonCanvas
          polygons={editor.polygons}
          hoveredDeleteId={editor.hoveredDeleteId}
          activePolygonRef={editor.activePolygonRef}
          isDrawing={editor.isDrawing}
          addPoint={editor.addPoint}
          startDrawing={editor.startDrawing}
          finishPolygon={editor.finishPolygon}
        />
      </div>

      <aside className="sidebar">
        <PolygonList
          polygons={editor.polygons}
          setHoveredDeleteId={
            editor.setHoveredDeleteId
          }
          onDelete={editor.removePolygon}
        />
      </aside>
    </div>
  );
}
