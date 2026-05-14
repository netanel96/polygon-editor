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
      <div className="toolbar">
        <div className="toolbar-group">
          <span className="toolbar-label">Edit</span>

          <button
            className="success-button"
            onClick={onFinish}
            disabled={!isDrawing || activePointCount === 0}
          >
            Finish Polygon
          </button>

          <button
            className="quiet-button"
            onClick={onClearEdit}
            disabled={!isDrawing && activePointCount === 0}
          >
            Clear Edit
          </button>
        </div>

        <div className="toolbar-group">
          <span className="toolbar-label">Data</span>

          <button
            className="secondary-button"
            onClick={onLoad}
            disabled={loading}
          >
            {loading && (
              <span
                className="button-spinner"
                aria-hidden="true"
              />
            )}
            {loading ? 'Loading...' : 'Reload Polygons'}
          </button>

          <button
            className="quiet-button"
            onClick={onClearLoaded}
            disabled={loading}
          >
            Clear Loaded
          </button>
        </div>
      </div>
    );
  }
