const Contact = require("./Contact");

function setupRoutes(app, fileContactService){
    app.get('/rest/contacts', (req, res) => {
        fileContactService.get(contacts => res.status(200).json(contacts));
    });

    app.get('/rest/contacts:id', (req, res) => {
        const id = parseInt(req.params.id);
        if(isNaN(id)){
            res.status(400).json({error: 'Invalid id'});
            return;
        }
        fileContactService.read(contacts => {
            const contact = contacts.find(c => c.id === id);
            if(!contact){
                res.status(404).json({error: 'Contact not found'});
                return;
            }
            res.status(200).json(contact);
        });
    });

    app.post('/rest/contacts', (req, res) => {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        if(!firstName || !lastName){
            res.status(400).json({error: 'Missing first name or last name'});
            return;
        }
        fileContactService.add(firstName, lastName, contact => res.status(201).json(contact));
    });

    app.put('/rest/contacts/:id', (req, res) => {
        const id = parseInt(req.params.id);
        if(isNaN(id)){
            res.status(400).json({error: 'Invalid id'});
            return;
        }
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        if(!firstName || !lastName){
            res.status(400).json({error: 'Missing first name or last name'});
            return;
        }
        fileContactService.read(contacts => {
            const contactIndex = contacts.findIndex(c => c.id === id);
            if(contactIndex === -1){
                res.status(404).json({error: 'Contact not found'});
                return;
            }
            const updatedContact = new Contact(id, firstName, lastName, contacts[contactIndex].address || '', contacts[contactIndex].phone || '');
            contacts[contactIndex] = updatedContact;
            fileContactService.write(contacts, () => res.status(200).json(updatedContact));
        });
    });
}

module.exports = function (app, io, fileContactService){
    io.on('connection', socket => {
        console.log('A user connected');

        socket.on ('disconnect', () => {
            console.log('User disconnected');
        });
    });

    setupRoutes(app, fileContactService);
}