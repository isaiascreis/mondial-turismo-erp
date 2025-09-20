// index.js - Servidor de Conexão WhatsApp

const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Render usa a variável de ambiente PORT

app.get('/', (req, res) => {
  res.send('Servidor de Conexão do WhatsApp está rodando na nuvem!');
});

app.listen(port, () => {
  console.log(`Servidor iniciado e escutando na porta ${port}`);
});