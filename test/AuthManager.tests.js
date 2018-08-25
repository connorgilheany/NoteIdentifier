let chai = require('chai');
let mocha = require('mocha');
let rewire = require('rewire');
let should = chai.should();


describe('JWT', () => {
    let AuthManager = rewire('../AuthManager');
    let jwt = AuthManager.__get__('createJWT')('randomuser');
    let [encodedHeader, encodedPayload, signature] = jwt.split('.');
    let verifyIntegrity = AuthManager.__get__('verifyIntegrity');
    describe('Verify Signature', () => {
       it('Should verify that signature is correct', done => {
           verifyIntegrity(encodedHeader, encodedPayload, signature).should.equal(true);
           done()
       });
       it('Should verify that signature is not correct', done => {
           verifyIntegrity(encodedHeader, encodedPayload.substring(2), signature).should.equal(false);
           done()
       });
    });
});
