const express = require('express');
const bodyParser = require('body-parser');
const programmer = require('./database/tables/programmer');

const app = express();
const port = 5000;

app.use(bodyParser.json());

/* Procura o diretório onde terá uma requisição */
app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname});
});

/* Porta onde o servidor irá iniciar */
app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
}); 

/*Tenta criar as tabelas do database, se ela já foi criada sincroniza os arquivos */
app.get('/syncDatabase', async (req, res) => {
    const database = require('./database/db');

    /* tendo sucesso retorna a resposta de sucesso */
    try {
        /* garante que o código irá aguardar a resposta do banco */
        await database.sync();

        res.send(`Database succesfully sync'ed`);
    } catch (error) {
        res.send(error);
    }
});

/* envia uma requisição post para adicionar informações na tabela */
app.post('/createProgrammer', async (req, res) => {

    /* verifica se foi enviado todos os valores necessários para a requisição e para salvar no banco de dados */
    try {
        const params = req.body;
        const properties = ['name', 'python', 'java', 'javascript'];
        const check = properties.every((property) => {
            return property in params;
    });

    /* se não passaram todos os valores na requisição envia a mensagem de erro e finaliza a função */
    if (!check) {
        const propStr = properties.join(', ');
        res.send(`All parameters needed to create a programmer must be sent: ${propStr}`);
        return;
    }

    /* se tudo der certo cria o novo programador */
    const newProgrammer = await programmer.create({
        name: params.name,
        python: params.python,
        javascript: params.javascript,
        java: params.java
    });
        res.send(newProgrammer);
    } catch (error) {
        res.send(error);
    }
});