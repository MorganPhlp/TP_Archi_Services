const chalk = require('chalk');

class Contact{
    constructor(id, firstName, lastName, address, phone){
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.address = address;
        this.phone = phone;
    }

    toString(useColors = true){
        return useColors
            ? chalk.blue(this.lastName.toUpperCase()) + " " + chalk.red(this.firstName)
            : this.lastName.toUpperCase() + " " + this.firstName;
    }
}

module.exports = Contact;