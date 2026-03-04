import { Card } from "./types.js";

export const CHANCE_CARDS: Card[] = [
  {
    id: "chance-advance-go",
    type: "chance",
    title: "Advance to GO",
    text: "Move to GO and collect $200.",
    effect: { type: "move", index: 0, reason: "Advance to GO" }
  },
  {
    id: "chance-go-jail",
    type: "chance",
    title: "Go to Jail",
    text: "Go directly to Jail. Do not pass GO.",
    effect: { type: "go_to_jail", reason: "Go to Jail" }
  },
  {
    id: "chance-bank-dividend",
    type: "chance",
    title: "Bank Dividend",
    text: "Bank pays you dividend of $50.",
    effect: { type: "money", amount: 50, reason: "Bank dividend" }
  },
  {
    id: "chance-repairs",
    type: "chance",
    title: "Street Repairs",
    text: "Pay $40 for each house. Pay $115 for each hotel.",
    effect: { type: "money", amount: -40, reason: "Street repairs" }
  },
  {
    id: "chance-go-back-3",
    type: "chance",
    title: "Go Back 3 Spaces",
    text: "Go back three spaces.",
    effect: { type: "move_relative", steps: -3, reason: "Go back 3" }
  },
  {
    id: "chance-advance-illinois",
    type: "chance",
    title: "Advance to Illinois",
    text: "Advance to Illinois Avenue.",
    effect: { type: "move", index: 24, reason: "Advance to Illinois" }
  },
  {
    id: "chance-advance-st-charles",
    type: "chance",
    title: "Advance to St. Charles",
    text: "Advance to St. Charles Place.",
    effect: { type: "move", index: 11, reason: "Advance to St. Charles" }
  },
  {
    id: "chance-get-out",
    type: "chance",
    title: "Get Out of Jail Free",
    text: "Keep this card until needed.",
    effect: { type: "get_out_of_jail", reason: "Get out of jail" }
  }
];

export const COMMUNITY_CARDS: Card[] = [
  {
    id: "community-advance-go",
    type: "community",
    title: "Advance to GO",
    text: "Move to GO and collect $200.",
    effect: { type: "move", index: 0, reason: "Advance to GO" }
  },
  {
    id: "community-bank-error",
    type: "community",
    title: "Bank Error",
    text: "Collect $200.",
    effect: { type: "money", amount: 200, reason: "Bank error" }
  },
  {
    id: "community-doctor-fee",
    type: "community",
    title: "Doctor's Fee",
    text: "Pay $50.",
    effect: { type: "money", amount: -50, reason: "Doctor fee" }
  },
  {
    id: "community-sale-stock",
    type: "community",
    title: "Sale of Stock",
    text: "Collect $50.",
    effect: { type: "money", amount: 50, reason: "Sale of stock" }
  },
  {
    id: "community-go-jail",
    type: "community",
    title: "Go to Jail",
    text: "Go directly to Jail. Do not pass GO.",
    effect: { type: "go_to_jail", reason: "Go to Jail" }
  },
  {
    id: "community-holiday-fund",
    type: "community",
    title: "Holiday Fund",
    text: "Receive $100.",
    effect: { type: "money", amount: 100, reason: "Holiday fund" }
  },
  {
    id: "community-income-tax",
    type: "community",
    title: "Income Tax Refund",
    text: "Collect $20.",
    effect: { type: "money", amount: 20, reason: "Tax refund" }
  },
  {
    id: "community-get-out",
    type: "community",
    title: "Get Out of Jail Free",
    text: "Keep this card until needed.",
    effect: { type: "get_out_of_jail", reason: "Get out of jail" }
  }
];