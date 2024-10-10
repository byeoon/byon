import { Content } from "@google/generative-ai";
import { Client, ThreadMemberFlagsBitField } from "discord.js";
import * as fs from "fs"

export default (client: Client) => {
    return console.log("JSON DB Manager Loaded!")
}

const getUserDBPath = (userId: string, path?: string): string => {
    let root = "user_db"
    switch (path) {
        case 'chatHistory':
            return `${root}/chat_history/${userId}.json`
            break;
        case 'settings':
            return `${root}/settings/${userId}.json`
            break;
        default:
            // defaults to chat history
            return `${root}/chat_history/${userId}.json`
            break;
    }
}

export const loadChatHistory = (userId: string): Array<Content> => {
    let chat_history: object | null
    
    try {
        chat_history = JSON.parse(fs.readFileSync(getUserDBPath(userId)).toString());
    } catch (err: any) {
        chat_history = null;
    }

    if (!chat_history) {
        chat_history = [];
        fs.writeFileSync(getUserDBPath(userId), JSON.stringify(chat_history));

        return chat_history as Array<Content>
    } else {
        return chat_history as Array<Content>
    }
}

export const appendChatHistory = (userId: string, jsons: Array<Content>): [boolean, any?] => {
    try {
        let chat_history: Array<Content> = loadChatHistory(userId);
        chat_history.push(...jsons)

        fs.writeFileSync(getUserDBPath(userId), JSON.stringify(chat_history));
        return [true]
    } catch (err: any) {
        return [false, err]
    }
}

export const purgeChatHistory = (userId: string): [boolean, any?] => {
    try {
        if (!fs.existsSync(getUserDBPath(userId))) throw new Error("History not found")
        fs.unlinkSync(getUserDBPath(userId));
        return [true]
    } catch (err: any) {
        return [false, err]
    }
}