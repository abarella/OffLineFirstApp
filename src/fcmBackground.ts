import '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    if (remoteMessage.data?.type === 'remote_update') {
      const current = await notifee.getBadgeCount();
      await notifee.setBadgeCount(current + 1);
    }
  } catch {
    // Evita crash em headless task.
  }
});
