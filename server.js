const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// servir arquivos estáticos da pasta files
app.use('/files', express.static(path.join(__dirname, 'files')));

// importar rotas
const agentesRoutes = require('./routes/agentes');
app.use('/api', agentesRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});