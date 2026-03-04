import { Tile } from "./types";

export const TILES: Tile[] = [
  { index: 0, name: "GO", type: "go" },
  {
    index: 1,
    name: "Mediterranean Avenue",
    type: "property",
    color: "brown",
    price: 60,
    baseRent: 2,
    houseCost: 50
  },
  { index: 2, name: "Community Chest", type: "community" },
  {
    index: 3,
    name: "Baltic Avenue",
    type: "property",
    color: "brown",
    price: 60,
    baseRent: 4,
    houseCost: 50
  },
  { index: 4, name: "Income Tax", type: "tax", tax: 200 },
  { index: 5, name: "Reading Railroad", type: "railroad", price: 200 },
  {
    index: 6,
    name: "Oriental Avenue",
    type: "property",
    color: "lightblue",
    price: 100,
    baseRent: 6,
    houseCost: 50
  },
  { index: 7, name: "Chance", type: "chance" },
  {
    index: 8,
    name: "Vermont Avenue",
    type: "property",
    color: "lightblue",
    price: 100,
    baseRent: 6,
    houseCost: 50
  },
  {
    index: 9,
    name: "Connecticut Avenue",
    type: "property",
    color: "lightblue",
    price: 120,
    baseRent: 8,
    houseCost: 50
  },
  { index: 10, name: "Jail", type: "jail" },
  {
    index: 11,
    name: "St. Charles Place",
    type: "property",
    color: "pink",
    price: 140,
    baseRent: 10,
    houseCost: 100
  },
  { index: 12, name: "Electric Company", type: "utility", price: 150 },
  {
    index: 13,
    name: "States Avenue",
    type: "property",
    color: "pink",
    price: 140,
    baseRent: 10,
    houseCost: 100
  },
  {
    index: 14,
    name: "Virginia Avenue",
    type: "property",
    color: "pink",
    price: 160,
    baseRent: 12,
    houseCost: 100
  },
  { index: 15, name: "Pennsylvania Railroad", type: "railroad", price: 200 },
  {
    index: 16,
    name: "St. James Place",
    type: "property",
    color: "orange",
    price: 180,
    baseRent: 14,
    houseCost: 100
  },
  { index: 17, name: "Community Chest", type: "community" },
  {
    index: 18,
    name: "Tennessee Avenue",
    type: "property",
    color: "orange",
    price: 180,
    baseRent: 14,
    houseCost: 100
  },
  {
    index: 19,
    name: "New York Avenue",
    type: "property",
    color: "orange",
    price: 200,
    baseRent: 16,
    houseCost: 100
  },
  { index: 20, name: "Free Parking", type: "free_parking" },
  {
    index: 21,
    name: "Kentucky Avenue",
    type: "property",
    color: "red",
    price: 220,
    baseRent: 18,
    houseCost: 150
  },
  { index: 22, name: "Chance", type: "chance" },
  {
    index: 23,
    name: "Indiana Avenue",
    type: "property",
    color: "red",
    price: 220,
    baseRent: 18,
    houseCost: 150
  },
  {
    index: 24,
    name: "Illinois Avenue",
    type: "property",
    color: "red",
    price: 240,
    baseRent: 20,
    houseCost: 150
  },
  { index: 25, name: "B. & O. Railroad", type: "railroad", price: 200 },
  {
    index: 26,
    name: "Atlantic Avenue",
    type: "property",
    color: "yellow",
    price: 260,
    baseRent: 22,
    houseCost: 150
  },
  {
    index: 27,
    name: "Ventnor Avenue",
    type: "property",
    color: "yellow",
    price: 260,
    baseRent: 22,
    houseCost: 150
  },
  { index: 28, name: "Water Works", type: "utility", price: 150 },
  {
    index: 29,
    name: "Marvin Gardens",
    type: "property",
    color: "yellow",
    price: 280,
    baseRent: 24,
    houseCost: 150
  },
  { index: 30, name: "Go To Jail", type: "go_to_jail" },
  {
    index: 31,
    name: "Pacific Avenue",
    type: "property",
    color: "green",
    price: 300,
    baseRent: 26,
    houseCost: 200
  },
  {
    index: 32,
    name: "North Carolina Avenue",
    type: "property",
    color: "green",
    price: 300,
    baseRent: 26,
    houseCost: 200
  },
  { index: 33, name: "Community Chest", type: "community" },
  {
    index: 34,
    name: "Pennsylvania Avenue",
    type: "property",
    color: "green",
    price: 320,
    baseRent: 28,
    houseCost: 200
  },
  { index: 35, name: "Short Line Railroad", type: "railroad", price: 200 },
  { index: 36, name: "Chance", type: "chance" },
  {
    index: 37,
    name: "Park Place",
    type: "property",
    color: "blue",
    price: 350,
    baseRent: 35,
    houseCost: 200
  },
  { index: 38, name: "Luxury Tax", type: "tax", tax: 100 },
  {
    index: 39,
    name: "Boardwalk",
    type: "property",
    color: "blue",
    price: 400,
    baseRent: 50,
    houseCost: 200
  }
];

export const TILE_COUNT = TILES.length;