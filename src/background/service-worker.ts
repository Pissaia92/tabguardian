import { saveSession } from '../libs/db';
import { Session } from '../types/session';

chrome.runtime.onMessage.addListener((message, _sender) => {
  if (message?.type === 'SAVE_SESSION') {
    saveSession(message.payload as Session)
      .then(() => {
        chrome.notifications.create({
          type: 'basic',
          title: 'TabGuardian',
          message: 'Sessão salva com sucesso!',
          iconUrl: 'icons/icon48.svg',
        });
      })
      .catch((err: any) => {
        console.error('Erro ao salvar sessão:', err);
        chrome.notifications.create({
          type: 'basic',
          title: 'TabGuardian',
          message: 'Erro ao salvar sessão.',
          iconUrl: 'icons/icon48.svg',
        });
      });
  }
});