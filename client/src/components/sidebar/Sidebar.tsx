import { Polygon } from '../../types/polygon';
import { PolygonList } from '../polygon-list';

import styles from './Sidebar.module.css';

type Props = {
  polygons: Polygon[];
  setHoveredDeleteId: (id: string | null) => void;
  removePolygon: (id: string) => void;
};

export function Sidebar({
  polygons,
  setHoveredDeleteId,
  removePolygon,
}: Props) {
  return (
    <aside className={styles.sidebar}>
      <PolygonList
        polygons={polygons}
        setHoveredDeleteId={setHoveredDeleteId}
        onDelete={removePolygon}
      />
    </aside>
  );
}
