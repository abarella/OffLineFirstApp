const pool = require("../config/db");
const { notifyRemoteEquipmentChanged } = require("../services/fcmPush.service");

function scheduleRemoteNotify(req) {
  const excludeToken = req.get("X-Fcm-Token") || null;
  setImmediate(() => {
    notifyRemoteEquipmentChanged(excludeToken).catch((err) => {
      console.warn("[FCM] notifyRemoteEquipmentChanged:", err?.message || err);
    });
  });
}

const mapEquipment = (row) => ({
  id: row.id,
  nome: row.nome,
  enderecoIP: row.endereco_ip,
  localizacao: row.localizacao,
  tipoEquipamento: row.tipo_equipamento,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getAllEquipments = async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM equipment ORDER BY id DESC");
    res.json(rows.map(mapEquipment));
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar equipamentos", error: error.message });
  }
};

const getEquipmentById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM equipment WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Equipamento nao encontrado" });
    }
    return res.json(mapEquipment(rows[0]));
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar equipamento", error: error.message });
  }
};

const createEquipment = async (req, res) => {
  try {
    const { id, nome, enderecoIP, localizacao, tipoEquipamento, status } = req.body;
    if (!nome || !enderecoIP || !localizacao || !tipoEquipamento || !status) {
      return res.status(400).json({ message: "Todos os campos sao obrigatorios" });
    }

    let result;
    if (id) {
      [result] = await pool.query(
        `INSERT INTO equipment (id, nome, endereco_ip, localizacao, tipo_equipamento, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, nome, enderecoIP, localizacao, tipoEquipamento, status]
      );
    } else {
      [result] = await pool.query(
        `INSERT INTO equipment (nome, endereco_ip, localizacao, tipo_equipamento, status)
         VALUES (?, ?, ?, ?, ?)`,
        [nome, enderecoIP, localizacao, tipoEquipamento, status]
      );
    }

    scheduleRemoteNotify(req);
    return res.status(201).json({
      id: id || result.insertId,
      nome,
      enderecoIP,
      localizacao,
      tipoEquipamento,
      status,
    });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao criar equipamento", error: error.message });
  }
};

const updateEquipment = async (req, res) => {
  try {
    const { nome, enderecoIP, localizacao, tipoEquipamento, status } = req.body;
    const [result] = await pool.query(
      `UPDATE equipment
       SET nome = ?, endereco_ip = ?, localizacao = ?, tipo_equipamento = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [nome, enderecoIP, localizacao, tipoEquipamento, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Equipamento nao encontrado" });
    }

    scheduleRemoteNotify(req);
    return res.json({ message: "Equipamento atualizado com sucesso" });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar equipamento", error: error.message });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM equipment WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Equipamento nao encontrado" });
    }
    scheduleRemoteNotify(req);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Erro ao remover equipamento", error: error.message });
  }
};

module.exports = {
  getAllEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
