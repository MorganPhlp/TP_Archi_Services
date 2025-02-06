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

module.exports = ContactService;