const sequelize = require('sequelize');

const database = new sequelize({
    dialect: 'sqlite',
    /* caminho e arquivo que salva as informações do banco de dados */
    storage: './database/storage/database.sqlite'
    });

/* exporta o banco pra poder acessa-lo de arquivos externos */
module.exports = database;