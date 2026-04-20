const pool = require("../config/db");

const registerToken = async (req, res) => {
  try {
    const token = req.body?.token;
    if (!token || typeof token !== "string" || token.length < 20) {
      return res.status(400).json({ message: "token invalido" });
    }

    await pool.query(
      `INSERT INTO fcm_tokens (token) VALUES (?)
       ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
      [token]
    );

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Erro ao registrar token", error: error.message });
  }
};

module.exports = { registerToken };
