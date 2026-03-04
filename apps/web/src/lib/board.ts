export type TileType =
  | "go"
  | "property"
  | "railroad"
  | "utility"
  | "chance"
  | "community"
  | "tax"
  | "jail"
  | "free_parking"
  | "go_to_jail";

export interface Tile {
  index: number;
  name: string;
  type: TileType;
  color?: string;
}

export const TILES: Tile[] = [
  { index: 0, name: "GO", type: "go" },
  { index: 1, name: "Mediterranean", type: "property", color: "brown" },
  { index: 2, name: "Community", type: "community" },
  { index: 3, name: "Baltic", type: "property", color: "brown" },
  { index: 4, name: "Income Tax", type: "tax" },
  { index: 5, name: "Reading RR", type: "railroad" },
  { index: 6, name: "Oriental", type: "property", color: "lightblue" },
  { index: 7, name: "Chance", type: "chance" },
  { index: 8, name: "Vermont", type: "property", color: "lightblue" },
  { index: 9, name: "Connecticut", type: "property", color: "lightblue" },
  { index: 10, name: "Jail", type: "jail" },
  { index: 11, name: "St. Charles", type: "property", color: "pink" },
  { index: 12, name: "Electric", type: "utility" },
  { index: 13, name: "States", type: "property", color: "pink" },
  { index: 14, name: "Virginia", type: "property", color: "pink" },
  { index: 15, name: "Penn RR", type: "railroad" },
  { index: 16, name: "St. James", type: "property", color: "orange" },
  { index: 17, name: "Community", type: "community" },
  { index: 18, name: "Tennessee", type: "property", color: "orange" },
  { index: 19, name: "New York", type: "property", color: "orange" },
  { index: 20, name: "Free Park", type: "free_parking" },
  { index: 21, name: "Kentucky", type: "property", color: "red" },
  { index: 22, name: "Chance", type: "chance" },
  { index: 23, name: "Indiana", type: "property", color: "red" },
  { index: 24, name: "Illinois", type: "property", color: "red" },
  { index: 25, name: "B&O RR", type: "railroad" },
  { index: 26, name: "Atlantic", type: "property", color: "yellow" },
  { index: 27, name: "Ventnor", type: "property", color: "yellow" },
  { index: 28, name: "Water Works", type: "utility" },
  { index: 29, name: "Marvin", type: "property", color: "yellow" },
  { index: 30, name: "Go To Jail", type: "go_to_jail" },
  { index: 31, name: "Pacific", type: "property", color: "green" },
  { index: 32, name: "North Carolina", type: "property", color: "green" },
  { index: 33, name: "Community", type: "community" },
  { index: 34, name: "Penn Ave", type: "property", color: "green" },
  { index: 35, name: "Short Line", type: "railroad" },
  { index: 36, name: "Chance", type: "chance" },
  { index: 37, name: "Park Place", type: "property", color: "blue" },
  { index: 38, name: "Luxury Tax", type: "tax" },
  { index: 39, name: "Boardwalk", type: "property", color: "blue" }
];