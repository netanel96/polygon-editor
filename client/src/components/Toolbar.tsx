type Props = {
    isDrawing: boolean;
    loading: boolean;
    onFinish: () => void;
    onLoad: () => void;
  };
  
  export function Toolbar({
    isDrawing,
    loading,
    onFinish,
    onLoad,
  }: Props) {
    return (
      <div className="toolbar">
        <button
          className="success-button"
          onClick={onFinish}
          disabled={!isDrawing}
        >
          Finish Polygon
        </button>
  
        <button
          className="secondary-button"
          onClick={onLoad}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Reload Polygons'}
        </button>
      </div>
    );
  }