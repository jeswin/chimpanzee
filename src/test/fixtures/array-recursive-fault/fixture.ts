import {
  any,
  capture,
  captureIf,
  literal,
  repeating,
  recursive,
  string
} from "../../../index.js";

export const input = {
  level1: [
    "comments",
    "off",
    ".",
    "url",
    "https://www.example.com",
    "title",
    "Hello",
    "world",
    ".",
    "promote"
  ],
  hello: "world"
};

const titleSchema = "title";
const commentsSchema = [literal("comments"), any([literal("off"), literal("on")])];
const urlSchema = [literal("url"), captureIf(x => typeof x === "string" &&  x.startsWith("https:"))];

export const schema = {
  level1: recursive(
    any([commentsSchema, urlSchema, titleSchema, ["."], ["promote"]])
  ),
  hello: capture()
};
