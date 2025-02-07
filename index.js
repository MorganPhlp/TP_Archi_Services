const FileContactService = require('./FileContactService');
const setupCli = require('./Cli');

const contactService = new FileContactService();
setupCli(contactService);