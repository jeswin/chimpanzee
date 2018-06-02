import {
  any,
  capture,
  captureIf,
  repeatingItem,
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

const titleSchema = seq(["title", repeatingItem(captureIf(x => x !== "."))]);
const commentsSchema = seq(["comments", any(["off", "on"])]);
const urlSchema = seq(["url", captureIf(x => x.startsWith("https:"))]);

export const schema = {
  level1: [
    repeatingItem(
      slice(any([commentsSchema, urlSchema, titleSchema, ".", "promote"]))
    )
  ]
};
