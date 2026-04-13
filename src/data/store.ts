import { Db, initialDb } from './seed';

declare global {
  // eslint-disable-next-line no-var
  var __labDb: Db | undefined;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function getDb(): Db {
  if (!global.__labDb) {
    global.__labDb = deepClone(initialDb);
  }
  return global.__labDb;
}

export function resetDb(): void {
  global.__labDb = deepClone(initialDb);
}
