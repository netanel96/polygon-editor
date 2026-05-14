import { PolygonModel } from '../models/polygonModel';

import { toPolygonDto } from './polygonMapper';
import type {
  PolygonDto,
  PolygonInput,
  PolygonRecord,
  PolygonRepository,
} from './polygonTypes';

export type PolygonModelLike = {
  find: () => {
    lean: () => Promise<PolygonRecord[]>;
  };
  create: (polygon: PolygonInput) => Promise<PolygonRecord>;
  findByIdAndDelete: (
    id: string,
  ) => Promise<unknown>;
};

export class MongoosePolygonRepository
  implements PolygonRepository
{
  constructor(private readonly model: PolygonModelLike) {}

  async findAll(): Promise<PolygonDto[]> {
    const polygons = await this.model.find().lean();

    return polygons.map(toPolygonDto);
  }

  async create(
    polygon: PolygonInput,
  ): Promise<PolygonDto> {
    return toPolygonDto(await this.model.create(polygon));
  }

  async deleteById(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }
}

export function createDefaultPolygonRepository() {
  return new MongoosePolygonRepository(
    PolygonModel as unknown as PolygonModelLike,
  );
}
