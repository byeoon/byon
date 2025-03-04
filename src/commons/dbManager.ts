import { Content } from "@google/generative-ai";
import { Client } from "discord.js";
import NodeCache from "node-cache";
import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, Transaction, CreationOptional, QueryTypes } from "sequelize";
import { getConfigValue, logger } from "../events/errorDebugger";
import fs from 'fs';

export interface userSettings {
  lastChatTimestamp?: number;
}

export interface guildSettings {
  AIChannelIds?: Array<string>
}

export interface ShoukoUserData {
  userId: string,
  userSettings?: userSettings
}

export interface ShoukoGuildData {
  guildId: string,
  guildSettings?: guildSettings
}

export interface ShoukoChatHistoryData {
  userId: string,
  chatHistory: Array<Content>;
}

export interface ActionsData {
  userGive: string,
  userRecieve: string,
  total: number;
}

export class ShoukoUser extends Model<InferAttributes<ShoukoUser>, InferCreationAttributes<ShoukoUser>> {
  declare userId: string;
  declare userSettings?: userSettings;
  declare createdAt?: CreationOptional<Date>;
  declare updatedAt?: CreationOptional<Date>;
}

export class ShoukoGuild extends Model<InferAttributes<ShoukoGuild>, InferCreationAttributes<ShoukoGuild>> {
  declare guildId: string;
  declare guildSettings?: guildSettings;
  declare createdAt?: CreationOptional<Date>;
  declare updatedAt?: CreationOptional<Date>;
}

export class ShoukoChatHistory extends Model<InferAttributes<ShoukoChatHistory>, InferCreationAttributes<ShoukoChatHistory>> {
  declare userId: string;
  declare chatHistory: Array<Content>;
  declare createdAt?: CreationOptional<Date>;
  declare updatedAt?: CreationOptional<Date>;
}


let sequelize: Sequelize;
let shoukoUserCache: NodeCache;
let chatHistoryCache: NodeCache;
let shoukoGuildCache: NodeCache;

let isDebugging = false;
let storageDbPath: string;
let messageCount: number = 0;
let queryCount: number = 0;

export default async (_client: Client, storage: string) => {
  isDebugging = process.env.DEBUG_MODE?.toLowerCase() === "true";
  storageDbPath = storage;
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storage,
    logging: msg => {
      queryCount += 1;
      isDebugging && logger(`[Shouko DB] ${msg}`)
    }
  });

  shoukoUserCache = new NodeCache();
  chatHistoryCache = new NodeCache();
  shoukoGuildCache = new NodeCache();

  ShoukoUser.init({
    userId: { type: DataTypes.STRING, primaryKey: true },
    userSettings: { type: DataTypes.JSON, defaultValue: { lastChatTimestamp: 0 } },
    createdAt: { type: DataTypes.DATE, allowNull: true },
    updatedAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    tableName: "users",
    timestamps: true
  });

  ShoukoChatHistory.init({
    userId: { type: DataTypes.STRING, primaryKey: true },
    chatHistory: { type: DataTypes.JSON, defaultValue: [] as Array<Content> },
    createdAt: { type: DataTypes.DATE, allowNull: true },
    updatedAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    tableName: "chatHistories",
    timestamps: true
  });

  ShoukoGuild.init({
    guildId: { type: DataTypes.STRING, primaryKey: true },
    guildSettings: { type: DataTypes.JSON, defaultValue: { AIChannelIds: [] } },
    createdAt: { type: DataTypes.DATE, allowNull: true },
    updatedAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    tableName: "guilds",
    timestamps: true
  })

  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    logger("[Shouko DB] DB manager loaded!");
  } catch (error) {
    logger(`[Shouko DB] Unable to connect to the database: ${error}`);
  }
};

export const getDatabaseSize = async (): Promise<string> => {
  const dialect = sequelize.getDialect();

  return loggedTransaction(async (transaction: Transaction) => {
    if (dialect === 'mysql') {
      const [results]: Array<any> = await sequelize.query(`
        SELECT table_schema AS "database", 
               SUM(data_length + index_length) / 1024 / 1024 AS "size_in_mb"
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
        GROUP BY table_schema;
      `, { type: QueryTypes.SELECT, transaction })
      return results[0].size_in_mb.toFixed(2) + " MB";
  
    } else if (dialect === 'postgres') {
      const [results]: Array<any> = await sequelize.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) AS size;
      `, { type: QueryTypes.SELECT, transaction });
      return results[0].size || "0 MB";
  
    } else if (dialect === 'sqlite') {
      const stats = fs.statSync(storageDbPath);
      return (stats.size / 1024 / 1024).toFixed(2) + " MB";
    } else {
      throw new Error ('Unsupported database dialect')
    }
  });
}

export const getAllMessageCount = async (): Promise<number> => {
  return await loggedTransaction(async (transaction: Transaction) => {
    if (messageCount <= 0) {
      messageCount = (await ShoukoChatHistory.findAll({ transaction })).map(c => c.chatHistory.length).reduce((a, b) => a + b, 0);
    }

    return messageCount;
  });
}

export const getQueryCount = (): number => {
  return queryCount
}

export const loggedTransaction = async (callback: (transaction: Transaction) => Promise<any>): Promise<any> => {
  const transaction = await sequelize.transaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    isDebugging && logger("[Shouko DB] Transaction committed successfully.");
    return result;
  } catch (error) {
    await transaction.rollback();
    logger(`[Shouko DB] Transaction failed, rolled back: ${error}`);
    throw error;
  }
};

const cacheAndReturnUser = (userId: string, user: ShoukoUserData | undefined) => {
  if (user) {
    shoukoUserCache.set(userId, user, getConfigValue("CACHE_TTL"));
    isDebugging && logger(`[Shouko DB] Cached user ${userId}: ${JSON.stringify(user)}`);
  }
  return user;
};

const cacheAndReturnGuild = (guildId: string, guild: ShoukoGuildData | undefined) => {
  if (guild) {
    shoukoGuildCache.set(guildId, guild, getConfigValue("CACHE_TTL"));
    isDebugging && logger(`[Shouko DB] Cached user ${guildId}: ${JSON.stringify(guild)}`);
  }
  return guild;
};

const fetchUserFromDb = async (userId: string, transaction?: Transaction): Promise<ShoukoUserData | undefined> => {
  const user = await ShoukoUser.findOne({ where: { userId }, transaction });
  return user ? user.get({ plain: true }) : undefined;
};

const fetchGuildFromDb = async (guildId: string, transaction?: Transaction): Promise<ShoukoGuildData | undefined> => {
  const guild = await ShoukoGuild.findOne({ where: { guildId }, transaction });
  return guild ? guild.get({ plain: true }) : undefined;
};

const getGuildData = async (guildId: string): Promise<ShoukoGuild | undefined> => {
  isDebugging && logger("[Shouko DB] Fetching guild data...");
  const cachedGuild = shoukoGuildCache.get<ShoukoGuild>(guildId);
  if (cachedGuild) {
    isDebugging && logger(`[Shouko DB] Serving guild ${guildId} from cache`);
    return cachedGuild;
  }

  return await loggedTransaction(async (transaction) => {
    const guild = await fetchGuildFromDb(guildId, transaction);
    return cacheAndReturnGuild(guildId, guild);
  });
};

const setGuildData = async (guildId: string, guildData: ShoukoGuild): Promise<boolean> => {
  if (!guildId) {
    throw new Error("Invalid guildId: guildId cannot be null or undefined.");
  }

  isDebugging && logger("[Shouko DB] Updating guild data...");
  
  return loggedTransaction(async (transaction) => {
    let guild = await ShoukoGuild.findOne({ where: { guildId }, transaction });
    
    if (guild) {
      // If the guild exists, update the record
      await guild.update(guildData, { transaction });
    } else {
      // If the guild does not exist, create a new record
      await ShoukoGuild.create({ ...guildData, guildId }, { transaction });
    }

    // Cache the updated guild
    cacheAndReturnGuild(guildId, guildData);
    return true;
  }).catch(err => {
    logger(`[Shouko DB] Failed to update guild ${guildId}: ${err}`);
    return false;
  });
};

export const getGuildVars = async (guildId: string, variable: string): Promise<any> => {
  if (!guildId) {
    throw new Error("Invalid guildId: guildId cannot be null or undefined.");
  }

  let guild = await getGuildData(guildId);

  // If the guild does not exist, create a default guild with default settings
  if (!guild) {
    guild = ShoukoGuild.build({ guildId, guildSettings: { AIChannelIds: [] } });
    await setGuildData(guildId, guild);
  }

  // Ensure guildSettings is initialized properly
  if (!guild.guildSettings) {
    guild.guildSettings = { AIChannelIds: [] };
  }

  return (guild.guildSettings as any)[variable] ?? null;
};

export const setGuildVars = async (guildId: string, variable: string, value: any): Promise<boolean> => {
  if (!guildId) {
    throw new Error("Invalid guildId: guildId cannot be null or undefined.");
  }

  let guild = await getGuildData(guildId);

  // If guild does not exist, create it with the provided variable in guildSettings
  if (!guild) {
    guild = ShoukoGuild.build({ guildId, guildSettings: { [variable]: value } });
  } else {
    // Ensure guildSettings is initialized
    guild.guildSettings = guild.guildSettings ?? {};
    (guild.guildSettings as any)[variable] = value;
  }

  return setGuildData(guildId, guild);
};

const getUserData = async (userId: string): Promise<ShoukoUser | undefined> => {
  isDebugging && logger("[Shouko DB] Fetching user data...");
  const cachedUser = shoukoUserCache.get<ShoukoUser>(userId);
  if (cachedUser) {
    isDebugging && logger(`[Shouko DB] Serving user ${userId} from cache`);
    return cachedUser;
  }

  return await loggedTransaction(async (transaction) => {
    const user = await fetchUserFromDb(userId, transaction);
    return cacheAndReturnUser(userId, user);
  });
};

const setUserData = async (userId: string, userData: ShoukoUser): Promise<boolean> => {
  if (!userId) {
    throw new Error("Invalid userId: userId cannot be null or undefined.");
  }

  isDebugging && logger("[Shouko DB] Updating user data...");
  
  return loggedTransaction(async (transaction) => {
    let user = await ShoukoUser.findOne({ where: { userId }, transaction });
    
    if (user) {
      // If the user exists, update the record
      await user.update(userData, { transaction });
    } else {
      // If the user does not exist, create a new record
      await ShoukoUser.create({ ...userData, userId }, { transaction });
    }

    // Cache the updated user
    cacheAndReturnUser(userId, userData);
    return true;
  }).catch(err => {
    logger(`[Shouko DB] Failed to update user ${userId}: ${err}`);
    return false;
  });
};

export const getUserVars = async (userId: string, variable: string): Promise<any> => {
  if (!userId) {
    throw new Error("Invalid userId: userId cannot be null or undefined.");
  }

  let user = await getUserData(userId);

  // If the user does not exist, create a default user with default settings
  if (!user) {
    user = ShoukoUser.build({ userId, userSettings: { lastChatTimestamp: 0 } });
    await setUserData(userId, user);
  }

  // Ensure userSettings is initialized properly
  if (!user.userSettings) {
    user.userSettings = { lastChatTimestamp: 0 };
  }

  return (user.userSettings as any)[variable] ?? null;
};

export const setUserVars = async (userId: string, variable: string, value: any): Promise<boolean> => {
  if (!userId) {
    throw new Error("Invalid userId: userId cannot be null or undefined.");
  }

  let user = await getUserData(userId);

  // If user does not exist, create it with the provided variable in userSettings
  if (!user) {
    user = ShoukoUser.build({ userId, userSettings: { [variable]: value } });
  } else {
    // Ensure userSettings is initialized
    user.userSettings = user.userSettings ?? {};
    (user.userSettings as any)[variable] = value;
  }

  return setUserData(userId, user);
};

export const loadChatHistory = async (userId: string): Promise<Array<Content>> => {
  const cachedData = chatHistoryCache.get<ShoukoChatHistoryData>(userId);
  if (cachedData) {
    return cachedData.chatHistory;
  }

  return await loggedTransaction(async (transaction) => {
    let history = await ShoukoChatHistory.findOne({ where: { userId: userId}, transaction: transaction });
    if (!history) {
      history = await ShoukoChatHistory.create({
        userId: userId,
        chatHistory: []
      }, {transaction: transaction});
    }

    // Set to cache
    chatHistoryCache.set(userId, history.toJSON(), getConfigValue("CACHE_TTL"));
    return history.chatHistory;
  });
};

export const appendChatHistory = async (userId: string, historyToAppend: Array<Content>): Promise<boolean> => {
  try {
    await loggedTransaction(async (transaction) => {
      let chatHistory = chatHistoryCache.get<ShoukoChatHistoryData>(userId);
      if (!chatHistory) chatHistory = (await ShoukoChatHistory.findOne({ where: { userId: userId}, transaction: transaction }))?.toJSON();
      if (!chatHistory) {
        chatHistory = (await ShoukoChatHistory.create({
          userId: userId,
          chatHistory: []
        }, {transaction: transaction})).toJSON();
      }

      chatHistory.chatHistory.push(...historyToAppend);
      messageCount += historyToAppend.length;
      if (chatHistory.chatHistory.length >= 50) chatHistory.chatHistory.splice(0, 2);
      chatHistoryCache.set<ShoukoChatHistoryData>(userId, chatHistory, getConfigValue("CACHE_TTL"));

      await ShoukoChatHistory.upsert(chatHistory, { transaction: transaction });
    });
    return true;
  } catch (err: any) {
    logger ("[Shouko DB] Unable to appendChatHistory: " + err);
    return false;
  }
};

export const purgeChatHistory = async (userId: string): Promise<boolean> => {
  try {
    chatHistoryCache.del(userId);
    await loggedTransaction(async (transaction) => {
      let chatHistory = await ShoukoChatHistory.findOne({ where: { userId: userId}, transaction: transaction });
      if (!chatHistory) {
        return;
      }

      messageCount -= chatHistory.chatHistory.length;

      await ShoukoChatHistory.destroy({
        where: {
          userId: userId
        },
        force: true,
        transaction: transaction
      });
    });
    return true;
  } catch (err: any) {
    logger ("[Shouko DB] Unable to purgeChatHistory: " + err);
    return false;
  }
};
