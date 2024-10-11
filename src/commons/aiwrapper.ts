import { Client, User } from "discord.js";
import { Content, GenerativeModel, GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import * as fs from "fs";
import { appendChatHistory, getUserVars, loadChatHistory, setUserVars } from "./dbManager";

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

export const getModel = (user?: User | undefined, debug?: boolean): GenerativeModel => {
    let buffer: string = fs.readFileSync("instructions.txt").toString();
    if (user && user instanceof User) {
        let lastChatTimestamp: number = getUserVars(user.id, "LAST_CHAT_HISTORY") || 0;
        buffer = buffer.replace("$USERNAME", user?.username)
        buffer = buffer.replace("$TIMESTAMP",  getRelativeTimeString(lastChatTimestamp))
    }
    if (debug) console.log(buffer);
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

export default (client: Client) => {
    try {
        genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
        model = getModel(undefined, true);
    } catch(err: any) {
        return console.log(err);
    }
    return console.log("AIWrapper Loaded!");     
}

export const generateText = async (text: string): Promise<string> => {
    return (await model.generateContent(text)).response.text()
}

export const chatBot = async (text: string, user: User, history?: Array<Content>): Promise<string> => {
    let chatHistory = history || loadChatHistory(user.id);
    let processedText = text;

    model = getModel(user);
    
    let response = (await model.startChat({
        history: chatHistory
    }).sendMessage(processedText)).response.text();

    appendChatHistory(user.id, [
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

    setUserVars(user.id, "LAST_CHAT_HISTORY", Date.now());

    return response;
}