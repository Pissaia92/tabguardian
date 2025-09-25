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