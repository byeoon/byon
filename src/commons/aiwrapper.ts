import { Client, User } from "discord.js";
import { Content, GenerativeModel, GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import * as fs from "fs";
import { appendChatHistory, loadChatHistory } from "./dbManager";

let genAI: GoogleGenerativeAI;
let model: GenerativeModel;

export const getModel = (user?: User | undefined, debug?: boolean): GenerativeModel => {
    let buffer: string = fs.readFileSync("instructions.txt").toString();
    if (user && user instanceof User) {
        buffer = buffer.replace("$USERNAME", user?.username)
    }
    if (debug) console.log(buffer);
    return genAI.getGenerativeModel({
        model: "gemini-1.5-flash-002",
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

    model = getModel(user, false);
    
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
            ]
        }
    ])

    return response;
}