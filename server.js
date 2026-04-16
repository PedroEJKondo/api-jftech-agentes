const express = require('express');
const app = express();

app.use(express.json());

// importar rotas
const agentesRoutes = require('./routes/agentes');
app.use('/api', agentesRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});