import { Polygon } from '../types/polygon';

import { VirtualList } from './VirtualList';

type Props = {
  polygons: Polygon[];
  setHoveredDeleteId: (id: string | null) => void;
  onDelete: (id: string) => void;
};

const POINT_ROW_HEIGHT = 28;
const MAX_VISIBLE_POINTS = 5;
const POLYGON_CARD_CHROME_HEIGHT = 96;
const POLYGON_ROW_GAP = 12;

function needsPointScroller(pointCount: number) {
  return pointCount > MAX_VISIBLE_POINTS;
}

function getPointListHeight(pointCount: number) {
  return (
    Math.min(pointCount, MAX_VISIBLE_POINTS) *
    POINT_ROW_HEIGHT
  );
}

function getPolygonRowHeight(polygon: Polygon) {
  return (
    POLYGON_CARD_CHROME_HEIGHT +
    getPointListHeight(polygon.points.length) +
    POLYGON_ROW_GAP
  );
}

export function PolygonList({
  polygons,
  setHoveredDeleteId,
  onDelete,
}: Props) {
  return (
    <div className="polygon-list-shell">
      <div className="sidebar-heading">
        <h2 className="sidebar-title">Polygons</h2>
        <span className="polygon-count">
          {polygons.length} found
        </span>
      </div>

      {polygons.length === 0 ? (
        <p className="empty-state">No polygons loaded.</p>
      ) : (
        <VirtualList
          items={polygons}
          className="polygon-virtual-list polished-scrollbar"
          getItemSize={getPolygonRowHeight}
          getKey={polygon => polygon.id}
          renderItem={polygon => (
            <div
              className={`polygon-card ${
                polygon.pending ? 'pending' : ''
              }`}
            >
              <div className="polygon-header">
                <div>
                  <strong>{polygon.name}</strong>
                  <span className="point-count">
                    {polygon.points.length} points
                  </span>
                </div>

                <button
                  className="danger-button"
                  onMouseEnter={() =>
                    !polygon.pending &&
                    setHoveredDeleteId(polygon.id)
                  }
                  onMouseLeave={() =>
                    setHoveredDeleteId(null)
                  }
                  onClick={() => onDelete(polygon.id)}
                  disabled={polygon.pending}
                >
                  Delete
                </button>
              </div>

              <VirtualList
                items={polygon.points}
                getItemSize={() => POINT_ROW_HEIGHT}
                className={`points-list ${
                  needsPointScroller(polygon.points.length)
                    ? 'polished-scrollbar'
                    : 'points-list-static'
                }`}
                getKey={(_point, index) => index}
                renderItem={(point, index) => (
                  <div className="point-row">
                    <span>#{index + 1}</span>
                    <span>
                      {point.x.toFixed(1)}, {point.y.toFixed(1)}
                    </span>
                  </div>
                )}
              />
            </div>
          )}
        />
      )}
    </div>
  );
}
