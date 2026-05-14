import mongoose from 'mongoose';

const polygonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    points: {
      type: [[Number]],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const PolygonModel = mongoose.model(
  'Polygon',
  polygonSchema,
);