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
        /* valida se os parametros passados foram corretos */
        validateProperties(properties, params, 'every');
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

/* função q busca os regitros na base de dados, podendo ou não passar um id como parametro */
app.get('/retrieveProgrammer', async (req, res) => {
    try {
        const params = req.query;
        if ('id' in params) {
            const record = await programmer.findByPk(params.id);
            if (record) {
                res.send(record);
            } else {
                res.send('No programmer found using received ID');
            }
            return;
        }
        const records = await programmer.findAll();
        res.send(records);
    } catch (error) {
        res.send(error);
    }
});

/* Função que atualiza os recursos do banco de dados passando um id como parametro*/
app.put('/updateProgrammer', async (req, res) => {
    try {
        const params = req.body;
        /*valida o id */
        const record = await validateID(params);
        /* verifica se existe e qual parametro foi passado para ser atualizado */
        const properties = ['name', 'python', 'java', 'javascript'];
        /* valida se os parametros passados foram corretos */
        validateProperties(properties, params, 'some');
        /* atualiza a base de dados ou mantém o que está salvo */
        record.name = params.name || record.name;
        /* if ternário, ? = if - : = else */
        record.python = 'python' in params ? params.python : record.python;
        record.java = 'java' in params ? params.java : record.java;
        record.javascript = 'javascript' in params ? params.javascript : record.javascript;
        await record.save();
        res.send(`${record.id} ${record.name} - Updated successfully`);
    } catch (error) {
        res.send(error);
    }
});

/* deleta um registro do banco de dados passando um id como parametro */
app.delete('/deleteProgrammer', async (req, res) => {
    try {
        const params = req.body;
        /*valida o id */
        const record = await validateID(params);
        /* deleta o registro */
        await record.destroy();
        res.send(`${record.id} ${record.name} - Deleted successfully`);
    } catch (error) {
        res.send(error);
    }
});

/* função que verifica e valida os id */
const validateID = async (params) => {
    try {
        /* confere se tem um id no parametro para a pesquisa */
        if (!('id') in params) {
            throw `Missing 'id' in request body`;
        }
        /* confere se a coluna da chave primária se existe o id passado como parametro */
        const record = await programmer.findByPk(params.id);
         /* confere se existe o id */
        if (!record) {
            throw `Programmer ID not found.`;
        }
        return record;
    } catch (error) {
    throw error;
    }
}

/* função que valida as propriedades do parametro */
const validateProperties = (properties, params, fn) => {
    try {
        /* Confere se os parametros foram passados */
        const check = properties[fn]((property) => {
            return property in params;
        });
        /* se os parametros foram passados confere se estão corretos */
        if (!check) {
            const propStr = properties.join(', ');
            throw `Request body doesn't have any of the following
        properties: ${propStr}`;
        }
            return true;
    } catch (error) {
        throw error;
    }
}