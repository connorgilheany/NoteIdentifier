let chai = require('chai');
let mocha = require('mocha');
let rewire = require('rewire');
let should = chai.should();

describe('Database', () => {
    let DatabaseManager = require('../Managers/LoginDatabaseManager');
    describe('Get hash and salt for test user', () => {
        it('Should have a hash and salt in the response', done => {
            DatabaseManager.getUserInfoFromDatabase('ConnorTEST2').then(response => {
                console.log(response);
                response.should.have.property('passHash');
                response.should.have.property('salt');
                done();
            }).catch(err => {
                console.log(err);
                throw err;
            });
        });
    });
});
