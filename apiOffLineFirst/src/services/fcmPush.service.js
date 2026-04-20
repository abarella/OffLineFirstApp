const admin = require("firebase-admin");
const pool = require("../config/db");

const ANDROID_CHANNEL_ID = "remote_sync";

let initAttempted = false;
let adminReady = false;

function initAdmin() {
  if (adminReady) return true;
  if (initAttempted && admin.apps.length === 0) return false;
  initAttempted = true;

  if (admin.apps.length > 0) {
    adminReady = true;
    return true;
  }

  const json = process.env.FCM_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(json)),
      });
      adminReady = true;
      return true;
    } catch (e) {
      console.error("[FCM] Falha ao ler FCM_SERVICE_ACCOUNT_JSON:", e.message);
      return false;
    }
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      admin.initializeApp();
      adminReady = true;
      return true;
    } catch (e) {
      console.error("[FCM] Falha ao inicializar com GOOGLE_APPLICATION_CREDENTIALS:", e.message);
      return false;
    }
  }

  console.warn(
    "[FCM] Firebase Admin nao configurado (FCM_SERVICE_ACCOUNT_JSON ou GOOGLE_APPLICATION_CREDENTIALS). Push desativado."
  );
  return false;
}

/**
 * Envia notificacao FCM a todos os tokens registrados, exceto o dispositivo que originou a mudanca.
 * @param {string | null | undefined} excludeToken Valor do header X-Fcm-Token do cliente.
 */
async function notifyRemoteEquipmentChanged(excludeToken) {
  if (!initAdmin()) return;

  let tokens;
  try {
    const [rows] = await pool.query("SELECT token FROM fcm_tokens");
    tokens = rows.map((r) => r.token).filter(Boolean);
  } catch (e) {
    console.warn("[FCM] Nao foi possivel ler fcm_tokens:", e.message);
    return;
  }

  if (excludeToken) {
    tokens = tokens.filter((t) => t !== excludeToken);
  }
  if (tokens.length === 0) return;

  const title = "Novidades";
  const body = "Equipamentos foram atualizados no servidor. Abra o app para sincronizar.";

  const chunkSize = 500;
  for (let i = 0; i < tokens.length; i += chunkSize) {
    const chunk = tokens.slice(i, i + chunkSize);
    try {
      const resp = await admin.messaging().sendEachForMulticast({
        tokens: chunk,
        notification: { title, body },
        data: { type: "remote_update" },
        android: {
          priority: "high",
          notification: {
            channelId: ANDROID_CHANNEL_ID,
            sound: "default",
          },
        },
      });
      console.log(
        `[FCM] multicast ok=${resp.successCount} falha=${resp.failureCount} lote=${i / chunkSize + 1}`
      );
    } catch (e) {
      console.error("[FCM] sendEachForMulticast:", e.message);
    }
  }
}

module.exports = { notifyRemoteEquipmentChanged, initAdmin };
