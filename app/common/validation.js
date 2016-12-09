

/** A module for validation names and passwords. */
module.exports = {

    minPasswordLen: 1,

    validateName: function(name) {
        if (name === null) return false;
        if (typeof name === "string") {
            return /^[^<>]+$/.test(name);
        }
        return false;
    },

    validateNameArray: function(arr) {
        for (var i = 0; i < arr.length; i++) {
            if (!this.validateName(arr[i])) return false;
        }
        return true;
    },

    validatePassword: function(pw) {
        if (pw === null) return false;
        if (typeof pw === "string") {
            return pw.length >= this.minPasswordLen;
        }
        return false;

    },

};
