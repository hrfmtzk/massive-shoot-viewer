import { LocationQueryValue } from "vue-router";

export function randomString(length: number): string {
  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return text;
}

export function base64UrlEncode(str: string): string {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function queryToStringStrict(
  value: LocationQueryValue | LocationQueryValue[]
): string {
  if (typeof value === "string" && value) {
    return value;
  }
  throw new Error("Invalid query value");
}
