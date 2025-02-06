//const data = require('../contacts.json');
const _ = require('lodash');
const chalk = require('chalk');
const fd = require('fs');

let useColors = true;

class Contact{
    constructor(id, firstName, lastName, address, phone){
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.address = address;
        this.phone = phone;
    }

    toString(){
        return useColors
            ? chalk.blue(this.lastName.toUpperCase()) + " " + chalk.red(this.firstName)
            : this.lastName.toUpperCase() + " " + this.firstName;
    }
}

/*
class ContactService{
    constructor(){
        this.contacts = data.map(c => new Contact(c.id, c.firstName, c.lastName, c.address, c.phone));
    }

    get(){
        return this.contacts;
    }

    print(){
        this.contacts.forEach(c => console.log(c.toString()));
    }
}

let contactService = new ContactService();
*/

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

    print(){
        this.read(contacts => contacts.forEach(c => console.log(c.toString())));
    }

    write(contacts, callback){
        const jsonData = JSON.stringify(contacts);
        fd.writeFile(this.path, jsonData, (err) => {
            if(err){
                console.error(err);
                return;
            }
            callback();
        });
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

                added.forEach(c => console.log('Added: ' + c.toString()));
                deleted.forEach(c => console.log('Deleted: ' + c.toString()));

                previousContacts = currentContacts;
            } catch (err){
                console.error(err);
            }
        });
    }
}

const argv = require('yargs')(process.argv.slice(2))
    .command({
        command : 'list',
        describe : 'List all contacts',
        builder : {
            colors : {
                describe : 'Use colors',
                type : 'boolean',
                default : true
            }
        },
        handler : (argv) => {
            useColors = argv.colors;
            let fileContactService = new FileContactService();
            fileContactService.print();
        }
    })
    .command({
        command : 'add',
        describe : 'Add a contact',
        builder : {
            firstName : {
                describe : 'First name',
                demandOption : true,
                type : 'string'
            },
            lastName : {
                describe : 'Last name',
                demandOption : true,
                type : 'string'
            }
        },
        handler : (argv) => {
            let fileContactService = new FileContactService();
            fileContactService.add(argv.firstName, argv.lastName, (contact) => console.log(contact.toString()));
        }
    })
    .command({
        command : 'delete',
        describe : 'Delete a contact',
        builder : {
            id : {
                describe : 'Contact id to delete',
                demandOption : true,
                type : 'number'
            }
        },
        handler : (argv) => {
            let fileContactService = new FileContactService();
            fileContactService.delete(argv.id, (deleted) => {
                if(deleted){
                    console.log('Contact deleted');
                } else {
                    console.log('Contact not found');
                }
            });
        }
    })
    .command({
        command : 'watch',
        describe : 'Watch for changes in contacts.json',
        handler : () => {
            let fileContactService = new FileContactService();
            fileContactService.watch();
        }
    })
    .help()
    .argv;