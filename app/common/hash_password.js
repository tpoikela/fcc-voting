
const crypto = require("crypto");

module.exports = {

    getHash: function(password) {
        var hash = crypto.createHash("sha256");
        return hash.update(password).digest("hex");
    },

};
