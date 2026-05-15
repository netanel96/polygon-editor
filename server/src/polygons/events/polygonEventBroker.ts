import type { PolygonEvent } from '../domain';

export type PolygonEventConnection = {
  send: (event: PolygonEvent) => void;
};

export type PolygonEventBroker = {
  publish: (event: PolygonEvent) => void;
};

export class PolygonConnectionStore {
  private readonly connections =
    new Set<PolygonEventConnection>();

  addConnection(connection: PolygonEventConnection) {
    this.connections.add(connection);

    return () => {
      this.connections.delete(connection);
    };
  }

  getConnections() {
    return this.connections;
  }
}

export class ConnectionBackedPolygonEventBroker
  implements PolygonEventBroker
{
  private readonly connections: PolygonConnectionStore;

  constructor(connections: PolygonConnectionStore) {
    this.connections = connections;
  }

  publish(event: PolygonEvent) {
    for (const connection of this.connections.getConnections()) {
      connection.send(event);
    }
  }
}
