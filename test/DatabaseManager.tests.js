let chai = require('chai');
let mocha = require('mocha');
let rewire = require('rewire');
let should = chai.should();

describe('Database', () => {
    let DatabaseManager = require('../DatabaseManager');
    describe('Get hash and salt for test user', () => {
        it('Should have a hash and salt in the response', done => {
            DatabaseManager.getHashAndSaltForUsername('ConnorTEST').then(response => {
                response.should.have.property('passHash');
                response.should.have.property('salt');
                done();
            }).catch(err => {
                throw err;
            });
        });
    });
});
