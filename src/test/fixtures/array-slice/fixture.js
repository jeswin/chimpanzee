import {
  any,
  array,
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

const titleSchema = slice(["title", repeatingItem(captureIf(x => x !== "."))]);
const commentsSchema = slice(["comments", any(["off", "on"])]);
const urlSchema = slice(["url", captureIf(x => x.startsWith("https:"))]);

export const schema = array([
  repeatingItem(any([commentsSchema, urlSchema, "promote", titleSchema, "."]))
]);
