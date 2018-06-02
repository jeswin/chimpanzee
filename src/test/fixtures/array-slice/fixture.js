import {
  any,
  capture,
  captureIf,
  repeatingItem,
  slice
} from "../../../chimpanzee";

export const input = {
  level1: [
    "comments",
    "off",
    "url",
    "https://www.example.com",
    "title",
    "Hello",
    "world",
    ".",
    "promote"
  ]
};

const titleSchema = ["title", repeatingItem(captureIf(x => x !== "."))];
const commentsSchema = ["comments", any(["off", "on"])];
const urlSchema = ["url", captureIf(x => x.startsWith("https:"))];

export const schema = {
  level1: [
    repeatingItem(any([commentsSchema, urlSchema, "promote", titleSchema, "."]))
  ]
};
