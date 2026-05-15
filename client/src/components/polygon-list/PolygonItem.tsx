import {classNames} from "../../utils/classNames.ts";
import { usePolygonEditorStore } from "../../stores";
import styles from "./PolygonList.module.css";
import {sharedStyles} from "../shared";
import {VirtualList} from "../virtual-list";
import {Polygon} from "../../types/polygon.ts";
import {MAX_VISIBLE_POINTS, POINT_ROW_HEIGHT} from "./PolygonList.tsx";

function needsPointScroller(pointCount: number) {
    return pointCount > MAX_VISIBLE_POINTS;
}

type PolygonItemProps = {
    polygon: Polygon
}

export function PolygonItem({polygon}: PolygonItemProps) {
    const editor = usePolygonEditorStore();

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
                        editor.polygonCollection.setHoveredDeleteId(
                            polygon.id,
                        )
                    }
                    onMouseLeave={() =>
                        editor.polygonCollection.setHoveredDeleteId(
                            null,
                        )
                    }
                    onClick={() => editor.removePolygon(polygon.id)}
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
