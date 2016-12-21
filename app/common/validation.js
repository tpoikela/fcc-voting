

/** A module for validating names and passwords. */
module.exports = function() {

    var minPasswordLen =  1;

    this.validateName = function(name) {
        if (name === null) return false;
        if (typeof name === "string") {
            return /^[^<>]+$/.test(name);
        }
        return false;
    };

    var validateName = this.validateName;

    this.validateNameArray = function(arr) {
        var i = 0;
        for (i = 0; i < arr.length; i++) {
            if (!validateName(arr[i])) return false;
        }
        return true;
    };

    this.validatePassword = function(pw) {
        if (pw === null) return false;
        if (typeof pw === "string") {
            return pw.length >= minPasswordLen;
        }
        return false;
    };

};
