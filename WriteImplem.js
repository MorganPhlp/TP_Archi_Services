const fd = require('fs');
const denodeify = require('denodeify');

exports.callback = function(path, contacts, callback){
    // 1. Lire fichier
    fd.readFile(path, (err, data) => {
        if(err){
            callback(err);
            return;
        }
        const jsonData = JSON.parse(data);
        const contacts = jsonData.map(c => new Contact(c.id, c.firstName, c.lastName, c.address, c.phone));
        callback(contacts);

        //2. Créer Backup
        fd.writeFile(path + '.back', data, err => {
            if(err){
                callback(err);
                return;
            }

            // 3. Réécrire fichier avec contacts en paramètre
            const jsonData = JSON.stringify(contacts);
            fd.writeFile(path, jsonData, err => {
                // 4. Si erreur, restaurer backup
                if(err) {
                    fd.rename(path + '.back', path, err2 => {
                        if (err2) {
                            callback(err2);
                            return;
                        }
                        callback(err);
                    });
                    return;
                }

                fd.unlink(path + '.back', err => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null);
                });
            });
        });
    });
}

exports.promise = function(path, contacts){
    const backup = path + '.back';
    const readFile = denodeify(fd.readFile);
    const writeFile = denodeify(fd.writeFile);
    const rename = denodeify(fd.rename);
    const unlink = denodeify(fd.unlink);

    return readFile(path)
        .then(data => {
            return writeFile(backup, data)
                .then(() => {
                    writeFile(path, JSON.stringify(contacts))
                        .then(() => {
                            return unlink(backup)
                            .catch(err => {
                                console.warn(err);
                            });
                        })
                        .catch(err => {
                            return rename(backup, path)
                                .then(() => {
                                    throw err;
                                });
                        });

                });
        });
}

exports.asyncAwait = async function(path, contacts) {
    const backup = path + '.back';
    const writeFile = denodeify(fd.writeFile);
    const readFile = denodeify(fd.readFile);
    const unlink = denodeify(fd.unlink);
    const rename = denodeify(fd.rename);

    try {
        const originalData = await readFile(path);
        await writeFile(backup, originalData);
        await writeFile(path, JSON.stringify(contacts));

        try {
            await unlink(backup);
        } catch (err) {
            console.warn(err);
        }
    } catch (err) {
        try{
            await rename(backup, path);
        } catch (err2) {
            throw new Error (err2);
        }
        throw new Error(err);
    }
}

