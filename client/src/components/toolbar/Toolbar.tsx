import {sharedStyles} from '../shared';

import styles from './Toolbar.module.css';

type Props = {
  isDrawing: boolean;
  activePointCount: number;
  loading: boolean;
  onFinish: () => void;
  onClearEdit: () => void;
  onLoad: () => void;
  onClearLoaded: () => void;
};

export function Toolbar({
  isDrawing,
  activePointCount,
  loading,
  onFinish,
  onClearEdit,
  onLoad,
  onClearLoaded,
}: Props) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.group}>
        <span className={styles.label}>Edit</span>

        <button
          className={sharedStyles.quietButton}
          onClick={onFinish}
          disabled={!isDrawing || activePointCount === 0}
        >
          Finish Polygon
        </button>

        <button
          className={sharedStyles.quietButton}
          onClick={onClearEdit}
          disabled={!isDrawing && activePointCount === 0}
        >
          Clear Edit
        </button>
      </div>

      <div className={styles.group}>
        <span className={styles.label}>Data</span>

        <button
          className={sharedStyles.quietButton}
          onClick={onLoad}
          disabled={loading}
        >
          {loading && (
            <span
              className={sharedStyles.spinner}
              aria-hidden="true"
            />
          )}
          {loading ? 'Loading...' : 'Reload Polygons'}
        </button>

        <button
          className={sharedStyles.quietButton}
          onClick={onClearLoaded}
          disabled={loading}
        >
          Clear Loaded
        </button>
      </div>
    </div>
  );
}
