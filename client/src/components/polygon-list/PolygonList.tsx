import {Polygon} from '../../types/polygon';
import {classNames} from '../../utils/classNames';
import {sharedStyles} from '../shared';
import {VirtualList} from '../virtual-list';

import styles from './PolygonList.module.css';
import {PolygonItem} from "./PolygonItem.tsx";

export type DeleteProps = {
    setHoveredDeleteId: (id: string | null) => void;
    onDelete: (id: string) => void;
}

type Props = {
    polygons: Polygon[];
} & DeleteProps;

export const POINT_ROW_HEIGHT = 28;
export const MAX_VISIBLE_POINTS = 5;
const POLYGON_CARD_CHROME_HEIGHT = 96;
const POLYGON_ROW_GAP = 12;


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
                    renderItem={polygon => <PolygonItem polygon={polygon}
                                                        setHoveredDeleteId={setHoveredDeleteId}
                                                        onDelete={onDelete}/>}
                />
            )}
        </div>
    );
}
