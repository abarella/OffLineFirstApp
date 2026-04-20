import React, { useEffect } from 'react';
import EquipmentScreen from './src/screens/EquipmentScreen';
import { initPushNotifications } from './src/services/PushNotifications';

const App = () => {
  useEffect(() => {
    let unsub: (() => void) | undefined;
    void (async () => {
      unsub = (await initPushNotifications()) ?? undefined;
    })();
    return () => {
      unsub?.();
    };
  }, []);

  return <EquipmentScreen />;
};

export default App;
