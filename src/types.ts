export interface Point {
  x: number;
  y: number;
}

export interface Anchor {
  point: Point;
  handle1?: Point;
  handle2?: Point;
}
