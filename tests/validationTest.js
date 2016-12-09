/**
 * Test file for app/common/validation.js
 */

const chai = require("chai");
const expect = chai.expect;

const Validation = require("../app/common/validation");

var V = new Validation();

describe('Validation module', function() {

    it('ensures names dont have < or >', function() {
        var result = V.validateName("<script>alert('xss');</script>");
        expect(result).to.equal(false);

        result = V.validateName("Tuomas Poikela");
        expect(result).to.equal(true);

        result = V.validateName(null);
        expect(result).to.equal(false);
    });

    it('verifies also full arrays of names', function() {

        var arrOk = ["aaafa", "asda12312sa", "dsa?&#Q@"];
        var result = V.validateNameArray(arrOk);
        expect(result).to.equal(true);

        arrNotOk = ["aa<a>fa", "asda12312sa", "dsa?&#Q@"];
        result = V.validateNameArray(arrNotOk);
        expect(result).to.equal(false);

        var nullArr = ["Tttt", "xXxax", null];
        result = V.validateNameArray(nullArr);
        expect(result).to.equal(false);

    });

    it('validates passwords', function() {
        var result = V.validatePassword('');
        expect(result).to.equal(false);

        result = V.validatePassword('goodPassWord');
        expect(result).to.equal(true);

    });

});
