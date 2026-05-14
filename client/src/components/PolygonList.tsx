import { Polygon } from '../types/polygon';

type Props = {
  polygons: Polygon[];
  setHoveredDeleteId: (id: string | null) => void;
  onDelete: (id: string) => void;
};

export function PolygonList({
  polygons,
  setHoveredDeleteId,
  onDelete,
}: Props) {
  return (
    <div>
      <h2 className="sidebar-title">Polygons</h2>

      {polygons.map(polygon => (
        <div
          key={polygon.id}
          className={`polygon-card ${
            polygon.pending ? 'pending' : ''
          }`}
        >
          <div className="polygon-header">
            <strong>{polygon.name}</strong>

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

          <div className="points-list">
            {polygon.points.map((point, index) => (
              <div key={index}>
                ({point.x.toFixed(1)},{' '}
                {point.y.toFixed(1)})
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
