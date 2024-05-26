/* eslint-env node */
'use strict';

// Ceci est notre scirpt principal, celui qui va lancer le serveur web

// imports d'express
const express = require('express');
const app = express();
// et de nos modules à nous !
const api = require('./api.js');
const auth = require('./auth.js');

// on met en place une authentification valide pour toute le site
const passport = auth(app);

// l'api d'accès aux données sera disponible sous la route "/api"
app.use('/api', api(passport));

// Le contenu statique public sera lu à partir du repertoire 'public'
app.use('/public', express.static('public'));

// Pour toutes les autres url (catch all) on renverra l'index.html
// c'est le routeur coté client qui fera alors le routing
app.use(function (req, res) {
    res.sendFile('public/login.html', {'root': __dirname});
});


// Création du serveur web pour notre application sur le port 8080
const server = app.listen(8080, function () {
    var port = server.address().port;
    console.log('Application lancée à l\'adresse suivante http://127.0.0.1:%s', port);
});
