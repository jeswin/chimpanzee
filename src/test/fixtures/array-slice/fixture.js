import {
  any,
  capture,
  captureIf,
  repeating,
  slice,
  string
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

const titleSchema = ["title", repeating(captureIf(x => x !== "."))];
const commentsSchema = ["comments", any(["off", "on"])];
const urlSchema = ["url", captureIf(x => x.startsWith("https:"))];

export const schema = {
  level1: [
    repeating(
      any([commentsSchema, urlSchema, titleSchema, ["."], ["promote"]]),
      { recursive: true }
    )
  ]
};
