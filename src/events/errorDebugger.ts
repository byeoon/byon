import { Client } from "discord.js";
import * as fs from "fs"

export interface ShoukoConfig {
  ERROR_MESSAGES?: Array<string>,
  CACHE_TTL: number,
  EMBED_COLOR: string,
  DEBUG: boolean,
  ERROR_REPLACES: object
}

var config: ShoukoConfig

const unhandledError = (err: any) => logger ("[Unhandled Error] " + err);

export default async (_client: Client) => {
  config = JSON.parse(fs.readFileSync("config.json").toString());

  if (config.DEBUG) process.env.DEBUG_MODE = "True";

  logger("Error Handler & Debugger Loaded!")

  process.on("unhandledRejection", unhandledError);
  process.on("uncaughtException", unhandledError);
}

export const makeErrorMessage = (err: any): string => {
  if (!config.ERROR_MESSAGES) return `Something had gone wrong!\n\`\`\`diff\n- ${err}\n\`\`\``
  return `${config.ERROR_MESSAGES[Math.floor(Math.random() * config.ERROR_MESSAGES.length)]}\n\`\`\`diff\n- ${err}\n\`\`\``
}

export const getConfigValue = (key: string): any => {
  return (config as any)[key]
}

export const logger = (text: any): void => {
  let date = new Date();
  return console.log(date.toUTCString() + " | " + text.toString());
} 