import { Polygon } from '../../types/polygon';
import { classNames } from '../../utils/classNames';
import { sharedStyles } from '../shared';
import { VirtualList } from '../virtual-list';

import styles from './PolygonList.module.css';

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
    <div className={styles.shell}>
      <div className={styles.heading}>
        <h2 className={styles.title}>Polygons</h2>
        <span className={styles.polygonCount}>
          {polygons.length} found
        </span>
      </div>

      {polygons.length === 0 ? (
        <p className={styles.emptyState}>No polygons loaded.</p>
      ) : (
        <VirtualList
          items={polygons}
          className={classNames(
            styles.polygonList,
            sharedStyles.scrollbar,
          )}
          getItemSize={getPolygonRowHeight}
          getKey={polygon => polygon.id}
          renderItem={polygon => (
            <div
              className={classNames(
                styles.polygonCard,
                polygon.pending && styles.pending,
              )}
            >
              <div className={styles.polygonHeader}>
                <div>
                  <strong>{polygon.name}</strong>
                  <span className={styles.pointCount}>
                    {polygon.points.length} points
                  </span>
                </div>

                <button
                  className={sharedStyles.dangerButton}
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
                className={classNames(
                  styles.pointsList,
                  needsPointScroller(polygon.points.length)
                    ? sharedStyles.scrollbar
                    : styles.pointsListStatic,
                )}
                getKey={(_point, index) => index}
                renderItem={(point, index) => (
                  <div className={styles.pointRow}>
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
