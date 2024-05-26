/* eslint-env node */
'use strict';
const fs = require('fs');

// Ce modules fournit quelques fonction pour simplifier l'accès
// à notre base de données sqlite

const createDb = () => {
    // try to read the file createDB.sql
    fs.readFile( 'createDB.sql', (err, data) => {
        if (err) {
            console.error(err + '\n' + 'Could not read createDB.sql. Cannot create database. Aborting.');
            require('process').exit(-1);
        }
        // populate the database with the content of createDB.sql
        db.exec(data.toString(), (err) => {
            if (err) {
                console.error(err + '\n' + 'Could not create and fill the database. Aborting.');
                require('process').exit(-1);
            }
        });
    });
};

const sqlite3 = require('sqlite3').verbose();
const needCreate = !require('fs').existsSync('./PolyMusic.db');
// Pas de problème pour faire un appel synchrone ici : on est dans la phase
// d'initialisation du serveur et pas dans le traitement de requêtes.
const db = new sqlite3.Database('./PolyMusic.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, function (err) {
    if (err) {
        console.error(err + '\n' + 'Could not open or create the database. Aborting.');
        require('process').exit(-1);
    }
    if (needCreate) {
        createDb();
    }
});

// Rend la fonction get de l'api sqlite compatible avec les promesses
const get = sql => new Promise(function (resolve, reject) {
    db.get(sql, function (err, row) {
        if (err) {
            reject(err);
        }
        else {
            resolve(row);
        }
    });
});

// Idem pour la fonction all
// si vous avez besoin d'utiliser de manière asynchrone d'autres fonctions de l'api
// sqlite (ex: pour écrire dans la base de données), vous pouvez vous inspirer de ces
// 2 fonctions pour les rendre compatibles avec les promesses
const all = sql => new Promise(function (resolve, reject) {
    db.all(sql, function (err, rows) {
        if (err) {
            reject(err);
        }
        else {
            resolve(rows);
        }
    });
});


// Cet export met à disposition des programmeurs 2 fonctions
// dbhelper.artists.byId, qui récupère les infos d'un artiste particulier (via son id)
// dbhelper.artists.all, qui récupère tous les artistes
module.exports.artists = {
    byId: id => ({
        get albums() {
            return all(`
                select year, album.name
                    from album, artist
                    where artist.id = artist_id
                        and artist.id = ${id|0};
            `);
        },
    }),
    all: () => all('select id, name from artist'),
};

// Cet export met à disposition des programmeurs 2 fonctions
// utiles pour l'authentification des utilisateurs
// dbhelper.users.byUsername, qui récupère un utilisateur par son nom
// dbhelper.users.byId, qui récupère un utilisateur par son Id
module.exports.users = {
    byUsername: (username) => get(`
        select id, password from user where name = '${username}';
    `),
    a: Promise.resolve({
        id: 0,
        checkPassword: (/*password*/) => true,
    }),
    byId: id => get(`select name as username from user where id = ${id}`),
};

