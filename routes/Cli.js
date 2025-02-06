const yargs = require('yargs');
const FileContactService = require("./FileContactService");

function setUpCli() {
    let useColors = true;

    return yargs(process.argv.slice(2))
        .command({
            command: 'list',
            describe: 'List all contacts',
            builder: {
                colors: {
                    describe: 'Use colors',
                    type: 'boolean',
                    default: true
                }
            },
            handler: (argv) => {
                useColors = argv.colors;
                let fileContactService = new FileContactService();
                fileContactService.print(useColors);
            }
        })
        .command({
            command: 'add',
            describe: 'Add a contact',
            builder: {
                firstName: {
                    describe: 'First name',
                    demandOption: true,
                    type: 'string'
                },
                lastName: {
                    describe: 'Last name',
                    demandOption: true,
                    type: 'string'
                }
            },
            handler: (argv) => {
                let fileContactService = new FileContactService();
                fileContactService.add(argv.firstName, argv.lastName, (contact) => console.log(contact.toString()));
            }
        })
        .command({
            command: 'delete',
            describe: 'Delete a contact',
            builder: {
                id: {
                    describe: 'Contact id to delete',
                    demandOption: true,
                    type: 'number'
                }
            },
            handler: (argv) => {
                let fileContactService = new FileContactService();
                fileContactService.delete(argv.id, (deleted) => {
                    if (deleted) {
                        console.log('Contact deleted');
                    } else {
                        console.log('Contact not found');
                    }
                });
            }
        })
        .command({
            command: 'watch',
            describe: 'Watch for changes in contacts.json',
            handler: () => {
                let fileContactService = new FileContactService();
                fileContactService.watch();
            }
        })
        .help()
        .argv;
}

module.exports = setUpCli;