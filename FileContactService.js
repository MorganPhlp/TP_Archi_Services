const _ = require('lodash');
const fd = require('fs');
const Contact = require('./Contact');
const ContactService = require('./ContactService');
const {useColors} = require("debug");
const writeImplem = require('./WriteImplem');

class FileContactService{
    path = 'contacts.json';
    read(callback){
        fd.readFile(this.path, (err, data) => {
            if(err){
                console.error(err);
                return;
            }
            const jsonData = JSON.parse(data);
            const contacts = jsonData.map(c => new Contact(c.id, c.firstName, c.lastName, c.address, c.phone));
            callback(contacts);
        })
    }

    get(callback){
        this.read(contacts => callback(contacts));
    }

    print(useColors = true){
        this.read(contacts => contacts.forEach(c => console.log(c.toString(useColors))));
    }

    write(contacts, callback){
        writeImplem.asyncAwait(this.path, contacts)
            .then(() => callback(true))
            .catch(err => console.error(err));
    }

    add(firstName, lastName, callback){
        this.read(contacts => {
            const maxId = Math.max(...contacts.map(c => c.id), 0);
            const newId = maxId + 1;

            const newContact = new Contact(newId, firstName, lastName, '', '');
            contacts.push(newContact);

            this.write(contacts, () => callback(newContact));
        });
    }

    delete(id, callback) {
        this.read(contacts => {
            const filteredContacts = contacts.filter(c => c.id !== id);

            if (filteredContacts.length === contacts.length) {
                callback(false);
                return;
            }

            this.write(filteredContacts, () => {
                callback(true);
            });
        });
    }

    readContacts(){
        try{
            const data = fd.readFileSync(this.path);
            const jsonData = JSON.parse(data);
            return jsonData.map(c => new Contact(c.id, c.firstName, c.lastName, c.address, c.phone));
        } catch(err){
            console.error(err);
        }
    }

    watch(){
        let previousContacts = this.readContacts();
        console.log('Watching contacts.json for changes... (Ctrl+C to stop)');

        fd.watch(this.path, (eventType, filename) => {
            try{
                const currentContacts = this.readContacts();

                const added = _.differenceBy(currentContacts, previousContacts, 'id');
                const deleted = _.differenceBy(previousContacts, currentContacts, 'id');

                added.forEach(c => console.log('Added: ' + c.toString(false)));
                deleted.forEach(c => console.log('Deleted: ' + c.toString(false)));

                previousContacts = currentContacts;
            } catch (err){
                console.error(err);
            }
        });
    }
}

module.exports = FileContactService;