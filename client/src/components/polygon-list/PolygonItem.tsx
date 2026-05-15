import {classNames} from "../../utils/classNames.ts";
import styles from "./PolygonList.module.css";
import {sharedStyles} from "../shared";
import {VirtualList} from "../virtual-list";
import {Polygon} from "../../types/polygon.ts";
import {DeleteProps, MAX_VISIBLE_POINTS, POINT_ROW_HEIGHT} from "./PolygonList.tsx";

function needsPointScroller(pointCount: number) {
    return pointCount > MAX_VISIBLE_POINTS;
}

type PolygonItemProps = {
    polygon: Polygon
} & DeleteProps

export function PolygonItem({polygon, setHoveredDeleteId, onDelete}: PolygonItemProps) {
    return (
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
    )
}