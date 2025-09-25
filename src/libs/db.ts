import Dexie, { Table } from 'dexie';

export interface TabSnapshot {
  url: string;
  title: string;
  favicon?: string;
  state?: any;
}

export interface Session {
  id: string;
  name: string;
  createdAt: number;
  tabs: TabSnapshot[];
}

const db = new Dexie('TabGuardianDB') as Dexie & {
  sessions: Table<Session>;
};

db.version(1).stores({
  sessions: '&id,createdAt,name',
});

export const saveSession = async (s: Session) => {
  await db.sessions.put(s);
};

export const getSessions = async () => {
  return await db.sessions.toArray();
};

export const getSession = async (id: string) => {
  return await db.sessions.get(id);
};