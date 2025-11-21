const {google} = require('googleapis');
const fs = require('fs');
const path = require('path');
const express = require('express'); 
async function autenticarGoogle() {
    const credenciais = JSON.parse(fs.readFileSync(path.join(__dirname, 'credentials.json')));
    const auth = new google.auth.GoogleAuth({
        credentials: credenciais,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return auth;
}

async function escreverNaPlanilha(auth, dados) {
    const sheets = google.sheets({version: 'v4', auth});
    const range = 'Página1!B:I';
    const valores = [Object.values(dados)];
    await sheets.spreadsheets.values.append({
        spreadsheetId: '1TNKz1JhNBY4F1qsFeg3E9Og-WEdQb3A1_GoyNwifhZM',
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {values: valores},
    });
    return {status: 'sucesso', mensagem: 'Pedido salvo na planilha.'};
}

let auth;
(async () => {
    auth = await autenticarGoogle();
    console.log('Autenticação com Google realizada com sucesso.');
})();
const app = express(); // Cria a aplicação

app.use(express.json());

function converterTextoEmJSON(texto) {
    const linhas = texto.split('\n');
    const pedido = {};
    linhas.forEach((linha) => {
        const partes = linha.split(':');
        const campo = partes[0].trim();
        const valor = partes[1].trim();
        pedido[campo] = valor;
    });
    return pedido;
}

app.get('/', (req, res) => {  // Cria rota GET
    res.json({ mensagem: 'Servidor rodando com sucesso!'});
});

app.post('/mensagem', async (req, res) => {
    try {
        const pedidoConvertido = converterTextoEmJSON(req.body.texto);
        await escreverNaPlanilha(auth, pedidoConvertido);
        res.json({status: 'sucesso', mensagem: 'Pedido recebido e salvo na planilha.'});
    } catch (erro) {
        res.status(500).json({status: 'erro', mensagem: 'Erro ao processar o pedido.'});
    }
});

app.listen(3000, () => {  // Inicia servidor
    console.log('Servidor rodadando em http://localhost:3000' );
});

