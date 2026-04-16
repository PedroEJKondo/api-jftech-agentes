const express = require('express');
const router = express.Router();
const db = require('../config/db');


// GET /agentes
router.get('/agentes', async (req, res) => {

    try {
        // const [rows] = await db.query('SELECT * FROM users LIMIT 4');
        // res.json(rows);

        const { page = 1, limit = 10, orgaoId, patenteId, cargoId, funcaoId, processoId, genero, nome } = req.query;

        const offset = (page - 1) * limit;

        // -----------------------------
        // BASE SQL (TUA CONSULTA)
        // -----------------------------
        let baseSql = `
            FROM sigpq_funcionarios F
            JOIN patentes P ON P.id = F.patente_id
            JOIN sigpq_funcionario_orgaos FO ON FO.pessoafisica_id = F.id
            JOIN pessoas ON pessoas.id = FO.id
            JOIN pessoajuridicas ON pessoajuridicas.id = FO.pessoajuridica_id
            WHERE FO.activo = true
            `;

        const params = [];

        // -----------------------------
        // FILTROS
        // -----------------------------
        if (nome) {
            baseSql += " AND F.nome_completo LIKE ?";
            params.push(`%${nome}%`);
        }

        if (genero) {
            baseSql += " AND F.genero = ?";
            params.push(genero);
        }

        if (patenteId) {
            baseSql += " AND P.id = ?";
            params.push(patenteId);
        }

        // if (processoId) {
        //     baseSql += " AND P.id = ?";
        //     params.push(processoId);
        // }

        // if (funcaoId) {
        //     baseSql += " AND P.id = ?";
        //     params.push(funcaoId);
        // }

        // if (cargoId) {
        //     baseSql += " AND P.id = ?";
        //     params.push(cargoId);
        // }

        // -----------------------------
        // TOTAL DE REGISTOS
        // -----------------------------
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total ${baseSql}`,
            params
        );

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        //   SELECT
        //     p.id,
        //     p.nome,
        //     o.nome AS orgao,
        //     c.nome AS cargo,
        //     f.nome AS funcao,
        //     pi.numero_processo
        //   FROM pessoas p
        //   LEFT JOIN orgao o ON o.id = p.orgao_id
        //   LEFT JOIN cargos c ON c.id = p.cargo_id
        //   LEFT JOIN funcoes f ON f.id = p.funcao_id
        //   LEFT JOIN processos_individuais pi ON pi.id = p.processo_id
        //   WHERE 1=1

        // -----------------------------
        // DADOS PAGINADOS
        // -----------------------------
        const [rows] = await db.query(
            `
            SELECT  
                F.id, 
                F.nome_completo, 
                F.pseudonimo, 
                F.foto_efectivo,
                F.genero, 
                F.data_nascimento, 
                F.data_adesao, 
                F.nip, 
                F.numero_agente,
                P.nome as Patente_nome,
                pessoajuridicas.sigla as Colocacao_sigla
            ${baseSql}
            ORDER BY F.id DESC
            LIMIT ? OFFSET ?
            `,
            [...params, parseInt(limit), parseInt(offset)]
        );

        // -----------------------------
        // RESPONSE
        // -----------------------------
        res.json({
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar dados' });
    }
});

// GET /agentes/:id
router.get('/agentes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        res.json(rows[0] || {});
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar usuário' });
    }
});

module.exports = router;