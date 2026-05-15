import {DynamicPolygonCanvas} from './DynamicPolygonCanvas';
import {StaticPolygonCanvas} from './StaticPolygonCanvas';
import styles from './PolygonCanvas.module.css';

export function PolygonCanvas() {
    return (
        <div className={styles.stage}>
            <StaticPolygonCanvas />

            <DynamicPolygonCanvas />
        </div>
    );
}
