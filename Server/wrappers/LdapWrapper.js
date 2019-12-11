const LdapAuth = require('ldapauth-fork');

module.exports = {
    authUser: function (options, user, pass) {
        return new Promise(function (resolve, reject) {
            let ldap = new LdapAuth(options);
            options.searchFilter = "uid=" + user;
            let searchField = "wmuUID=" + user + ", ou=people, o=wmich.edu, dc=wmich, dc=edu";

            ldap.on('error', (err) => {
                if (err) {
                    ldap.close();
                    reject({res: "auth-failed", error: "Couldn't Connect to the LDAP Sever"});
                }
            });
            ldap.authenticate(searchField, pass, function (err, user) {
                if (err) {
                    ldap.close();
                    reject({res: "auth-failed", error: "Invalid-Credentials"});
                }
                ldap.close();
                resolve({res: "auth-success"});
            });
        });
    },
};