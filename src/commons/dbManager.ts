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

export const getUserVars = (userId: string, variable: string): any => {
    let userVars: object | undefined

    try {
        userVars = JSON.parse(fs.readFileSync(getUserDBPath(userId, "settings")).toString());
    } catch (err: any) {
        userVars = undefined;
    }

    if (!userVars) {
        userVars = {};
        fs.writeFileSync(getUserDBPath(userId, "settings"), JSON.stringify(userVars))

        return undefined;
    } else {
        return (userVars as any)[variable];
    }
}

export const setUserVars = (userId: string, variable: string, value: any): [boolean] => {
    let userVars: object | undefined

    try {
        userVars = JSON.parse(fs.readFileSync(getUserDBPath(userId, "settings")).toString());
    } catch (err: any) {
        userVars = undefined
    }

    if (!userVars) {
        userVars = {};
        (userVars as any)[variable] = value;
        try {
            fs.writeFileSync(getUserDBPath(userId, "settings"), JSON.stringify(userVars));
        } catch(err: any) { 
            return [false]; 
        }
    } else {
        (userVars as any)[variable] = value;
        try {
            fs.writeFileSync(getUserDBPath(userId, "settings"), JSON.stringify(userVars));
        } catch (err: any) {
            return [false]
        }
    }
    return [true]
}

export const loadChatHistory = (userId: string): Array<Content> => {
    let chat_history: object | undefined
    
    try {
        chat_history = JSON.parse(fs.readFileSync(getUserDBPath(userId)).toString());
    } catch (err: any) {
        chat_history = undefined;
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
        setUserVars(userId, "LAST_CHAT_HISTORY", undefined);
        return [true]
    } catch (err: any) {
        return [false, err]
    }
}