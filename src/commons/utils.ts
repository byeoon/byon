import { Client, GuildMember, Routes, User } from "discord.js";
import { getConfigValue } from "../events/errorDebugger";
import { RawUserData } from "discord.js/typings/rawDataTypes";
import { restClient } from "..";
import NodeCache from "node-cache";
import { getAllMessageCount, getQueryCount } from "./dbManager";

let rawUserCache: NodeCache;
let rawMemberCache: NodeCache;
let _client: Client;

export default (client: Client) => {
  rawUserCache = new NodeCache();
  rawMemberCache = new NodeCache();
  _client = client;
}

export const getUsername = (user: User | GuildMember): string => {
  if (user instanceof GuildMember) user = user.user;
  if (user.tag.endsWith("#0000")) return user.username;
  return user.tag;
}

export const getClan = async (user: User): Promise<{ tag: string }> => {
  let rawUser = await getRawUser(_client, user);
  //console.log((rawUser as any).clan);
  return (rawUser as any).clan;
}

export const getUserBadgesEmojis = async (user: User, withLink?: boolean): Promise<Array<string>> => {
  let badges: Array<string> = [];

  // Check if user is bot
  if (user.bot) {
    let badge = "Bot";
    badges.push(withLink && getConfigValue("BADGES_LIST")[badge].url 
      ? `[${getConfigValue("BADGES_LIST")[badge].emoji}](${getConfigValue("BADGES_LIST")[badge].url})` 
      : getConfigValue("BADGES_LIST")[badge].emoji);

    if (user.id === _client.user?.id) {
      badge = "Komi";
      badges.push(withLink && getConfigValue("BADGES_LIST")[badge].url 
        ? `[${getConfigValue("BADGES_LIST")[badge].emoji}](${getConfigValue("BADGES_LIST")[badge].url})` 
        : getConfigValue("BADGES_LIST")[badge].emoji);
    }

    return badges;
  } else if ((getConfigValue("DEV_USERS") as Array<string>).includes(user.id)) {
    let badge = "Byeoon";
    badges.push(withLink && getConfigValue("BADGES_LIST")[badge].url 
      ? `[${getConfigValue("BADGES_LIST")[badge].emoji}](${getConfigValue("BADGES_LIST")[badge].url})` 
      : getConfigValue("BADGES_LIST")[badge].emoji);
  }

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
    let rawUser = await restClient.get(Routes.user(user.id)) as RawUserData;
    rawUserCache.set(user.id, rawUser, getConfigValue("CACHE_TTL"));
    return rawUser;
  } 
  return rawUserCache.get<RawUserData>(user.id);
}

export interface RawMemberData extends Partial<GuildMember> {
  banner?: string
}

export const getRawMember = async (_client: Client, member: GuildMember, options?: RawUserOptions): Promise<RawMemberData | undefined> => {
  if(!rawMemberCache.has(member.id) || options?.force) {
    let rawMember = await restClient.get(Routes.guildMember(member.guild.id, member.id)) as RawMemberData;
    rawMemberCache.set(member.id, rawMember, getConfigValue("CACHE_TTL"));
    return rawMember;
  } 
  return rawMemberCache.get<RawMemberData>(member.id);
}

export const splitArrayIntoChunks = (array: Array<any>, chunkSize: number): Array<Array<any>> => {
  const result: Array<Array<any>> = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

export const getAllResourceUsage = async (): Promise<any> => {
  const memoryUsage = process.memoryUsage();
  const memoryUsageInMB = {
    rss: (memoryUsage.rss / 1024 / 1024).toFixed(2), // Resident Set Size
    heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2), // V8's heap total
    heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2), // V8's heap used
    external: (memoryUsage.external / 1024 / 1024).toFixed(2), // C++ objects bound to JavaScript objects
  };

  const processUsage = {
    dbQueriesSinceRestart: getQueryCount(),
    dbRecordCount: await getAllMessageCount()
  }

  return {...memoryUsageInMB, ...processUsage}
}
