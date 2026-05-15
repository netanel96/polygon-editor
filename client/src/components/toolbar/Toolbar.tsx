import { observer } from 'mobx-react-lite';

import { usePolygonEditorStore } from '../../stores';
import {sharedStyles} from '../shared';

import styles from './Toolbar.module.css';

export const Toolbar = observer(function Toolbar() {
  const editor = usePolygonEditorStore();
  const { activePolygon, polygonCollection } = editor;

  return (
    <div className={styles.toolbar}>
      <div className={styles.group}>
        <span className={styles.label}>Edit</span>

        <button
          className={sharedStyles.quietButton}
          onClick={editor.finishPolygon}
          disabled={
            !activePolygon.isDrawing ||
            activePolygon.pointCount === 0
          }
        >
          Finish Polygon
        </button>

        <button
          className={sharedStyles.quietButton}
          onClick={editor.clearEditedPolygon}
          disabled={
            !activePolygon.isDrawing &&
            activePolygon.pointCount === 0
          }
        >
          Clear Edit
        </button>
      </div>

      <div className={styles.group}>
        <span className={styles.label}>Data</span>

        <button
          className={sharedStyles.quietButton}
          onClick={editor.loadPolygons}
          disabled={polygonCollection.loading}
        >
          {polygonCollection.loading && (
            <span
              className={sharedStyles.spinner}
              aria-hidden="true"
            />
          )}
          {polygonCollection.loading
            ? 'Loading...'
            : 'Reload Polygons'}
        </button>

        <button
          className={sharedStyles.quietButton}
          onClick={editor.clearLoadedPolygons}
          disabled={polygonCollection.loading}
        >
          Clear Loaded
        </button>
      </div>
    </div>
  );
});
