import {PolygonList} from '../polygon-list';

import styles from './Sidebar.module.css';

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <PolygonList />
    </aside>
  );
}
