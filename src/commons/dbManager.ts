import { Content } from "@google/generative-ai";
import { Client } from "discord.js";
import NodeCache from "node-cache";
import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, Transaction, CreationOptional } from "sequelize";
import { getConfigValue, logger } from "../events/errorDebugger";

export interface userSettings {
  lastChatTimestamp?: number;
}

export interface ShoukoUserData {
  userId: string,
  userSettings?: userSettings,
  chatHistory?: Array<Content>
}

export class ShoukoUser extends Model<InferAttributes<ShoukoUser>, InferCreationAttributes<ShoukoUser>> {
  declare userId: string;
  declare userSettings?: userSettings;
  declare chatHistory?: Array<Content>;
  declare createdAt?: CreationOptional<Date>;
  declare updatedAt?: CreationOptional<Date>;
}

let sequelize: Sequelize;
let shoukoCache: NodeCache;
let isDebugging = false;

export default async (client: Client, storage: string) => {
  isDebugging = process.env.DEBUG_MODE?.toLowerCase() === "true";
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storage,
    logging: msg => isDebugging && logger(`[Shouko DB] ${msg}`)
  });

  shoukoCache = new NodeCache();

  ShoukoUser.init({
    userId: { type: DataTypes.STRING, primaryKey: true },
    userSettings: { type: DataTypes.JSON, defaultValue: { lastChatTimestamp: 0 } },
    chatHistory: { type: DataTypes.JSON, defaultValue: [] },
    createdAt: { type: DataTypes.DATE, allowNull: true },
    updatedAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    tableName: "users",
    timestamps: true
  });

  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    logger("[Shouko DB] DB manager loaded!");
  } catch (error) {
    logger(`[Shouko DB] Unable to connect to the database: ${error}`);
  }
};

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
    shoukoCache.set(userId, user, getConfigValue("CACHE_TTL"));
    isDebugging && logger(`[Shouko DB] Cached user ${userId}: ${JSON.stringify(user)}`);
  }
  return user;
};

const fetchUserFromDb = async (userId: string, transaction?: Transaction): Promise<ShoukoUserData | undefined> => {
  const user = await ShoukoUser.findOne({ where: { userId }, transaction });
  return user ? user.get({ plain: true }) : undefined;
};

const getUserData = async (userId: string): Promise<ShoukoUser | undefined> => {
  isDebugging && logger("[Shouko DB] Fetching user data...");
  const cachedUser = shoukoCache.get<ShoukoUser>(userId);
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
  const user = await getUserData(userId);
  return user?.chatHistory ?? [];
};

export const appendChatHistory = async (userId: string, jsons: Array<Content>): Promise<boolean> => {
  let user = await getUserData(userId);
  const chatHistory = user?.chatHistory ?? [];
  chatHistory.push(...jsons);
  user = user ?? ShoukoUser.build({ userId });
  user.chatHistory = chatHistory;
  return setUserData(userId, user);
};

export const purgeChatHistory = async (userId: string): Promise<boolean> => {
  let user = await getUserData(userId);
  if (!user) user = ShoukoUser.build({ userId });
  user.chatHistory = [];
  await setUserVars(userId, "lastChatTimestamp", 0);
  return setUserData(userId, user);
};
