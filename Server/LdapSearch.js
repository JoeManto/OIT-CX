const LdapClient = require('ldapjs-client');
const ldapConfig = require('./SecertConfig.js').ldap_config();

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

let client = new LdapClient({url: options.url,tlsOptions: options.tlsOptions});

class LdapSearch {
    async bind() {
        try {
            await client.bind(options.bindDN, options.bindCredentials);
            return "binded"
        } catch (e) {
            console.log('Bind failed');
        }
        return client
    }

    async unbind() {
        try {
            await client.unbind();
            return "unbinded";
        } catch (e) {
            console.log("un-bind failed");
        }
    }

    async search (user) {
        return this.bind()
        .then(async () => {
            try {
                const searchOptions = {
                    scope: "sub",
                    filter: "(uid=" + user + ")",
                    sizeLimit: 2,
                };
                return await client.search(options.searchBase, searchOptions);
            } catch (e) {
                console.log(e);
            }
        })
        .then((_) => {
            //console.log(_);
            return {data: _}
        })
        .catch(error => console.log(error));
    }
}

module.exports = LdapSearch;
