const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const setupRoutes = require('./Router');

function createServer(contactService) {
    const app = express();
    const port = process.env.PORT || 3000;

    // Middlewares
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    setupRoutes(app, contactService);

    // Fichiers statiques
    app.use(express.static(path.join(__dirname, 'public')));

    // Gestion des erreurs
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: 'Something broke!' });
    });

    // Démarrage du serveur
    const start = () => {
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    };

    return {
        app,
        start
    };
}

module.exports = createServer;
