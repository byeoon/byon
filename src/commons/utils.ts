import { Client, GuildMember, Routes, User } from "discord.js";
import { getConfigValue } from "../events/errorDebugger";
import { RawUserData } from "discord.js/typings/rawDataTypes";
import { restClient } from "..";
import NodeCache from "node-cache";

let rawUserCache: NodeCache;

export default (_client: Client) => {
  rawUserCache = new NodeCache();
}

export const getUsername = (user: User | GuildMember): string => {
  if (user instanceof GuildMember) user = user.user;
  if (user.tag.endsWith("#0000")) return user.username;
  return user.tag;
}

export const getUserBadgesEmojis = async (user: User, withLink?: boolean): Promise<Array<string>> => {
  let badges: Array<string> = [];

  // Check if user is bot
  if (user.bot) return [];

  (await user.fetchFlags(true)).toArray().map(badge => {
    if (getConfigValue("BADGES_LIST")[badge]) {
      badges.push(withLink && getConfigValue("BADGES_LIST")[badge].url 
      ? `[${getConfigValue("BADGES_LIST")[badge].emoji}](${getConfigValue("BADGES_LIST")[badge].url})` 
      : getConfigValue("BADGES_LIST")[badge].emoji)
    }
  });

  // Checks if user has nitro
  if (user.banner || user.displayAvatarURL({ forceStatic: false }).endsWith(".gif")) {
    let badge = "Nitro";
    badges.push(withLink && getConfigValue("BADGES_LIST")[badge].url 
      ? `[${getConfigValue("BADGES_LIST")[badge].emoji}](${getConfigValue("BADGES_LIST")[badge].url})` 
      : getConfigValue("BADGES_LIST")[badge].emoji)
  }
  return badges;
}

export interface RawUserOptions {
  force: boolean
}

export const getRawUser = async (_client: Client, user: User, options?: RawUserOptions): Promise<RawUserData | undefined> => {
  if(!rawUserCache.has(user.id) || options?.force) {
    let rawUser: RawUserData = await restClient.get(Routes.user(user.id)) as RawUserData;
    rawUserCache.set(user.id, rawUser, getConfigValue("CACHE_TTL"));
    return rawUser;
  } 
  return rawUserCache.get<RawUserData>(user.id);
}

export const splitArrayIntoChunks = (array: Array<any>, chunkSize: number): Array<Array<any>> => {
  const result: Array<Array<any>> = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}