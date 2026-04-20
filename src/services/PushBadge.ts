import notifee from '@notifee/react-native';
import { Platform } from 'react-native';

export async function clearLauncherBadge(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  try {
    await notifee.setBadgeCount(0);
  } catch {
    // Ignorado: módulo nativo indisponível em builds sem Notifee.
  }
}
