const LdapAuth = require('ldapauth-fork');
const ldapConfig = require('../SecertConfig.js').ldap_config();

module.exports = {
    authUser: function (user, pass) {

        let options = {
            url: ldapConfig.url + ldapConfig.port,
            bindDN: ldapConfig.dn,
            bindCredentials: ldapConfig.pw,
            searchBase: ldapConfig.bn,
            searchFilter: 'uid=blank',
            searchAttributes: ['sn'],
            tlsOptions: {
                minVersion: 'TLSv1',
            }
        };

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