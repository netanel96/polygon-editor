import type { Request, Response } from 'express';

import { config } from '../../config';
import { createPolygonSchema, type PolygonRepository } from '../domain';
import type {
  PolygonConnectionStore,
  PolygonEventBroker,
} from '../events';

import { addSseConnection } from './ssePolygonConnection';

type PolygonHandlersOptions = {
  connections: PolygonConnectionStore;
  eventBroker: PolygonEventBroker;
  polygonRepository: PolygonRepository;
  wait: (ms: number) => Promise<unknown>;
};

async function waitForApiDelay(
  wait: PolygonHandlersOptions['wait'],
) {
  await wait(config.apiRequestDelayMs);
}

function parseCreatePolygonRequest(request: Request) {
  return createPolygonSchema.parse(request.body);
}

function getPolygonId(request: Request) {
  const { id } = request.params;

  return Array.isArray(id) ? id[0] : id;
}

function sendSuccess(response: Response) {
  response.json({
    success: true,
  });
}

export class PolygonHandlers {
  private readonly connections: PolygonConnectionStore;
  private readonly eventBroker: PolygonEventBroker;
  private readonly polygonRepository: PolygonRepository;
  private readonly wait: PolygonHandlersOptions['wait'];

  constructor({
    connections,
    eventBroker,
    polygonRepository,
    wait,
  }: PolygonHandlersOptions) {
    this.connections = connections;
    this.eventBroker = eventBroker;
    this.polygonRepository = polygonRepository;
    this.wait = wait;
  }

  listPolygons = async (
    _request: Request,
    response: Response,
  ) => {
    await waitForApiDelay(this.wait);

    response.json(await this.polygonRepository.findAll());
  };

  addPolygonEventConnection = (
    request: Request,
    response: Response,
  ) => {
    const removeConnection = addSseConnection(
      this.connections,
      response,
    );

    request.on('close', removeConnection);
  };

  createPolygon = async (
    request: Request,
    response: Response,
  ) => {
    await waitForApiDelay(this.wait);

    const parsed = parseCreatePolygonRequest(request);
    const polygon = await this.polygonRepository.create({
      name: parsed.name,
      points: parsed.points,
    });

    this.eventBroker.publish({
      type: 'created',
      polygon,
    });

    response.json(polygon);
  };

  deletePolygon = async (
    request: Request,
    response: Response,
  ) => {
    await waitForApiDelay(this.wait);

    const polygonId = getPolygonId(request);

    await this.polygonRepository.deleteById(polygonId);

    this.eventBroker.publish({
      type: 'deleted',
      id: polygonId,
    });

    sendSuccess(response);
  };
}
