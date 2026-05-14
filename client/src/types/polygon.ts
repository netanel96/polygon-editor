export type Point = {
    x: number;
    y: number;
  };
  
  export type Polygon = {
    id: string;
    name: string;
    points: Point[];
    pending?: boolean;
  };