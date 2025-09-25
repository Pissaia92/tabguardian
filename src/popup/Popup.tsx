import React, { useEffect, useState } from 'react';

interface TabSnapshot {
  url: string;
  title: string;
  favicon?: string;
  state?: any;
}

interface Session {
  id: string;
  name: string;
  createdAt: number;
  tabs: TabSnapshot[];
}

const Popup: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get(['sessions'], (result: { [key: string]: any }) => {
      const savedSessions = result.sessions || [];
      setSessions(savedSessions);
    });
  }, []);

  const handleSaveCurrent = async () => {
    const tabs = await chrome.tabs.query({});

    const session: Session = {
      id: Date.now().toString(),
      name: `Sessão ${new Date().toLocaleString()}`,
      createdAt: Date.now(),
      tabs: [],
    };

    for (const tab of tabs) {
      if (!tab.url) continue;

      const captureMessage = {
        type: 'CAPTURE_STATE',
        payload: { tabId: tab.id },
      };

      const response: any = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id!, captureMessage, (res: any) => resolve(res));
      });

      const tabSnapshot: TabSnapshot = {
        url: tab.url,
        title: tab.title || 'Sem título',
        favicon: tab.favIconUrl,
        state: response || {},
      };

      session.tabs.push(tabSnapshot);
    }

    chrome.storage.local.set({ sessions: [...sessions, session] }, () => {
      console.log('Sessão salva:', session);
      chrome.notifications.create({
        type: 'basic',
        title: 'TabGuardian',
        message: 'Sessão salva com sucesso!',
        iconUrl: 'icons/icon48.svg',
      });
    });
  };

  const handleRestore = async () => {
    if (!selectedSession) return;

    const session = sessions.find((s) => s.id === selectedSession);
    if (!session) return;

    const newTabs = await Promise.all(
      session.tabs.map(async (tab) => {
        return await chrome.tabs.create({ url: tab.url });
      })
    );

    const tabIds = newTabs
      .map((t: chrome.tabs.Tab) => t.id)
      .filter((id): id is number => id !== undefined);
    await chrome.tabs.move(tabIds, { index: 0 });
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'Arial, sans-serif' }}>
      <h2>TabGuardian</h2>
      <button onClick={handleSaveCurrent}>Salvar Sessão Atual</button>
      <div style={{ marginTop: '16px' }}>
        <h3>Sessões Salvas</h3>
        <select
          value={selectedSession || ''}
          onChange={(e) => setSelectedSession(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        >
          <option value="">Selecione uma sessão</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.name} ({new Date(session.createdAt).toLocaleString()})
            </option>
          ))}
        </select>
        <button onClick={handleRestore} style={{ marginTop: '8px' }}>
          Restaurar Selecionada
        </button>
      </div>
    </div>
  );
};

export default Popup;