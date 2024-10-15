import { User } from "discord.js";

export const getUsername = (user: User): string => {
  if (user.tag.endsWith("#0000")) return user.username;
  return user.tag;
}

export const splitArrayIntoChunks = (array: Array<any>, chunkSize: number): Array<Array<any>> => {
  const result: Array<Array<any>> = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}