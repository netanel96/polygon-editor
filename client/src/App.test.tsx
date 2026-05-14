import {
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type { Polygon } from './types/polygon';

import App from './App';

const api = vi.hoisted(() => ({
  fetchPolygons: vi.fn<() => Promise<Polygon[]>>(),
  createPolygon:
    vi.fn<(polygon: Polygon) => Promise<Polygon>>(),
  deletePolygon: vi.fn<(id: string) => Promise<void>>(),
}));

vi.mock('./api/polygonApi', () => api);

vi.mock('./components/PolygonCanvas', () => ({
  PolygonCanvas: ({
    addPoint,
    finishPolygon,
    startDrawing,
  }: {
    addPoint: (point: { x: number; y: number }) => void;
    finishPolygon: () => void;
    startDrawing: () => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() => {
          startDrawing();
          addPoint({ x: 0, y: 0 });
        }}
      >
        Draw one point
      </button>

      <button
        type="button"
        onClick={() => {
          startDrawing();
          addPoint({ x: 0, y: 0 });
          addPoint({ x: 10, y: 0 });
          addPoint({ x: 0, y: 10 });
          void finishPolygon();
        }}
      >
        Draw triangle
      </button>
    </div>
  ),
}));

const savedPolygon: Polygon = {
  id: 'polygon-1',
  name: 'Triangle',
  points: [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 0, y: 10 },
  ],
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

describe('App polygon operations', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('crypto', {
      randomUUID: () => 'temp-id',
    });

    api.fetchPolygons.mockResolvedValue([]);
    api.createPolygon.mockImplementation(async polygon => ({
      ...polygon,
      id: 'created-polygon',
      pending: undefined,
    }));
    api.deletePolygon.mockResolvedValue(undefined);
  });

  it('loads polygons from the API and shows them in the list', async () => {
    api.fetchPolygons.mockResolvedValue([savedPolygon]);

    render(<App />);

    expect(api.fetchPolygons).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText('Triangle'),
    ).toBeInTheDocument();
    expect(screen.getByText('(0.0, 0.0)')).toBeInTheDocument();
  });

  it('creates a polygon optimistically and replaces it with the saved polygon', async () => {
    const createRequest = deferred<Polygon>();

    api.createPolygon.mockReturnValue(
      createRequest.promise,
    );

    render(<App />);

    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Draw triangle',
      }),
    );

    expect(screen.getByText('Polygon 1')).toBeInTheDocument();

    const pendingDeleteButton = screen.getByRole('button', {
      name: 'Delete',
    });

    expect(pendingDeleteButton).toBeDisabled();
    expect(api.createPolygon).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'temp-temp-id',
        name: 'Polygon 1',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 0, y: 10 },
        ],
        pending: true,
      }),
    );

    createRequest.resolve({
      id: 'polygon-2',
      name: 'Polygon 1',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 10 },
      ],
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'Delete',
        }),
      ).toBeEnabled();
    });
  });

  it('enables finish after the first point and explains when more points are needed', async () => {
    render(<App />);

    const finishButton = screen.getByRole('button', {
      name: 'Finish Polygon',
    });

    expect(finishButton).toBeDisabled();

    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Draw one point',
      }),
    );

    expect(finishButton).toBeEnabled();

    await userEvent.click(finishButton);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Add 2 more points to finish this polygon.',
    );
    expect(api.createPolygon).not.toHaveBeenCalled();
  });

  it('clears the active edited polygon without saving it', async () => {
    render(<App />);

    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Draw one point',
      }),
    );

    const finishButton = screen.getByRole('button', {
      name: 'Finish Polygon',
    });

    expect(finishButton).toBeEnabled();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Clear Edit',
      }),
    );

    expect(finishButton).toBeDisabled();
    expect(api.createPolygon).not.toHaveBeenCalled();
  });

  it('clears loaded polygons from the current view without deleting them from the API', async () => {
    api.fetchPolygons.mockResolvedValue([savedPolygon]);

    render(<App />);

    expect(
      await screen.findByText('Triangle'),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Clear Loaded',
      }),
    );

    expect(
      screen.queryByText('Triangle'),
    ).not.toBeInTheDocument();
    expect(api.deletePolygon).not.toHaveBeenCalled();
  });

  it('removes a polygon after a successful delete request', async () => {
    api.fetchPolygons.mockResolvedValue([savedPolygon]);

    render(<App />);

    expect(
      await screen.findByText('Triangle'),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Delete',
      }),
    );

    expect(api.deletePolygon).toHaveBeenCalledWith(
      'polygon-1',
    );
    expect(
      screen.queryByText('Triangle'),
    ).not.toBeInTheDocument();
  });

  it('restores a polygon and shows a dismissible notification when delete fails', async () => {
    api.fetchPolygons.mockResolvedValue([savedPolygon]);
    api.deletePolygon.mockRejectedValue(
      new Error('delete failed'),
    );

    render(<App />);

    expect(
      await screen.findByText('Triangle'),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Delete',
      }),
    );

    expect(
      await screen.findByText('Triangle'),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Failed to delete polygon');

    await userEvent.click(screen.getByText('Polygon Editor'));

    expect(
      screen.queryByRole('alert'),
    ).not.toBeInTheDocument();
  });
});
