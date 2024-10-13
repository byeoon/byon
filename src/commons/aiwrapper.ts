import { Client, User } from "discord.js";
import { Content, GenerativeModel, GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import * as fs from "fs";
import { appendChatHistory, getUserVars, loadChatHistory, setUserVars } from "./dbManager";
import { getConfigValue, logger } from "../events/errorDebugger";

let genAI: GoogleGenerativeAI;
let model: GenerativeModel;

export const getRelativeTimeString = (time: number): string => {
  let difference = time > 0 ? Date.now() - time : 0;
  let identifier: string | undefined;
  let divider: number = 1_000;
  let firstTime: boolean = time === 0;
  if (Math.abs(difference) >= 1_000 && Math.abs(difference) < 60_000) {
    identifier = "seconds";
  } else if (Math.abs(difference) >= 60_000 && Math.abs(difference) < 60_000 * 60) {
    identifier = "minutes";
    divider = 1_000 * 60;
  } else if (Math.abs(difference) >= 60_000 * 60 && Math.abs(difference) < 60_000 * 60 * 24) {
    identifier = "hours";
    divider = 1_000 * 60 * 60;
  } else if (Math.abs(difference) >= 60_000 * 60 * 24) {
    identifier = "days";
    divider = 1_000 * 60 * 60 * 24;
  } else {
    identifier = undefined;
  }

  if (identifier) {
    return `${Math.round(Math.abs(difference/divider))} ${identifier} later`
  } else if (firstTime) {
    return `First time chatting!`
  }
  return "";
}

export const getModel = async (user?: User | undefined, debug?: boolean): Promise<GenerativeModel> => {
  let buffer: string = fs.readFileSync("instructions.txt").toString();
  if (user && user instanceof User) {
    let lastChatTimestamp: number = await getUserVars(user.id, "lastChatTimestamp") || 0;
    buffer = buffer.replace("$USERNAME", user?.username)
    buffer = buffer.replace("$TIMESTAMP",  getRelativeTimeString(lastChatTimestamp))
  }
  if (debug) logger (buffer);
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    generationConfig: {
      temperature: 0.95,
      candidateCount: 1,
      maxOutputTokens: 1536
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE
      }
    ],
    systemInstruction: buffer
  });
}

export default async (client: Client) => {
  try {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
    model = await getModel(undefined, true);
  } catch(err: any) {
    return logger (err);
  }
  return logger ("AIWrapper Loaded!");   
}

export const filterEmojis = (text: string): string => {
  let emojiReplaceList: object = getConfigValue("EMOJI_REPLACES");
  let modifiedText = text;
  for (var emoji in emojiReplaceList) {
    if (emojiReplaceList.hasOwnProperty(emoji)) {
      modifiedText = modifiedText.replace(emoji, (emojiReplaceList as any)[emoji])
    }
  }
  modifiedText = modifiedText.replace(/(\p{EPres}|\p{ExtPict})(\u200d(\p{EPres}|\p{ExtPict}))*/gu, "");
  modifiedText = modifiedText == "" ? "..." : modifiedText;
  return modifiedText;
}

export const generateText = async (text: string): Promise<string> => {
  return (await model.generateContent(text)).response.text()
}

export const chatBot = async (text: string, user: User, history?: Array<Content>): Promise<string> => {
  let chatHistory = history || await loadChatHistory(user.id);
  let processedText = text;

  model = await getModel(user);
  
  let response = (await model.startChat({
    history: chatHistory
  }).sendMessage(processedText)).response.text();

  if (response.length <= 1) response = "...";
  if (processedText.length <= 1) processedText = "...";

  await appendChatHistory(user.id, [
    {
      role: "user",
      parts: [
        { text: processedText }
      ]
    },
    { 
      role: "model",
      parts: [
        { text: response }
      ],
    }
  ])

  await setUserVars(user.id, "lastChatTimestamp", Date.now());

  return filterEmojis(response);
}