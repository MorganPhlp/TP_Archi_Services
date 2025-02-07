const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const router = require('./Router');
const socketio = require('socket.io');

function createServer(contactService) {
    const app = express();
    const port = process.env.PORT || 3000;

    // Middlewares
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Fichiers statiques
    app.use(express.static(path.join(__dirname, 'public')));

    function start(){
        const server = app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

        const io = socketio(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST', 'PUT']
            }
        });

        router(app, io, contactService);
    }

    // Gestion des erreurs
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: 'Something broke!' });
    });

    return {
        app,
        start
    };
}

module.exports = createServer;
