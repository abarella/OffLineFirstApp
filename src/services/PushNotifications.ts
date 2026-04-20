import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import { Platform } from 'react-native';
import ApiService, { setFcmTokenForApiHeaders } from './ApiService';

const CHANNEL_ID = 'remote_sync';

async function bumpBadge(): Promise<void> {
  try {
    const current = await notifee.getBadgeCount();
    await notifee.setBadgeCount(current + 1);
  } catch {
    // noop
  }
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Sincronização remota',
    importance: AndroidImportance.DEFAULT,
  });
}

/**
 * Registra FCM, envia token à API e inscreve listener em foreground.
 * @returns função para remover o listener de foreground (ou vazio).
 */
export async function initPushNotifications(): Promise<(() => void) | void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await ensureAndroidChannel();

  const perm = await notifee.requestPermission();
  if (perm.authorizationStatus === AuthorizationStatus.DENIED) {
    return;
  }

  await messaging().registerDeviceForRemoteMessages();

  const token = await messaging().getToken();
  if (token) {
    setFcmTokenForApiHeaders(token);
    try {
      await ApiService.registerFcmToken(token);
    } catch (e) {
      console.warn('registerFcmToken:', e);
    }
  }

  messaging().onTokenRefresh(async newToken => {
    setFcmTokenForApiHeaders(newToken);
    try {
      await ApiService.registerFcmToken(newToken);
    } catch {
      // noop
    }
  });

  const unsub = messaging().onMessage(async msg => {
    if (msg.data?.type === 'remote_update') {
      await bumpBadge();
    }
  });

  return unsub;
}
