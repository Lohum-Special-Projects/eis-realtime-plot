// export interface DataPoint {
//   x: number;
//   y: number;
//   z: number;
//   category: "A" | "B" | "C";
//   isHighlighted?: boolean; // for highlighting processed points
// }

export interface DataPoint {
  PK: string;
  SK: string;
  Zreal: number;
  Zimg: number;
  Frequency: number;
  UpdatedAt: string;
  Test_ID: number;
  Channel_ID: number;
  [key: string]: any;
}

export interface ProcessedPoint {
  x: number;
  y: number;
  z: number;
  category: "A" | "B" | "C";
  isHighlighted?: boolean;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
  category: "A" | "B" | "C";
  isHighlighted?: boolean;
}
