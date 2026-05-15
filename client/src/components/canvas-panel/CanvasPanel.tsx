import {PolygonCanvas} from '../polygon-canvas';
import {Toolbar} from '../toolbar';

import styles from './CanvasPanel.module.css';

export function CanvasPanel() {
  return (
    <main className={styles.panel}>
      <h1 className={styles.title}>Polygon Editor</h1>

      <Toolbar />

      <PolygonCanvas />
    </main>
  );
}
