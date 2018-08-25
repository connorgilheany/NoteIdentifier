const hmacSHA256 = require('crypto-js/hmac-sha256');
const secretFile = require('./secrets/hash');
const uuid = require('uuid/v4');
const strings = require('./strings');


function addCookieIfNeeded(req, res, next) {
    if(!req.cookies[strings.cookie_name]) {
        req.app.locals.user = uuid();
        console.log(`Adding cookie for user: ${req.app.locals.user}`);
        res.cookie(strings.cookie_name, createJWT(req.app.locals.user));
    }
    next();
}

function getUserIDfromCookie(req, res, next) {
    if(req.cookies[strings.cookie_name]) {
        let payload = decodeJWT(req.cookies[strings.cookie_name]);
        req.app.locals.user = payload.userID;
    }
    next();
}

function createJWT(userID) {
    let encodedHeader = encodeObject({
        "typ": "JWT",
        "alg": "HS256"
    });
    let encodedPayload = encodeObject({
        "userID": userID
    });
    let signature = generateSignature(encodedHeader, encodedPayload);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function decodeJWT(jwt) {
    let [encodedHeader, encodedPayload, signature] = jwt.split('.');
    if(!verifyIntegrity(encodedHeader, encodedPayload, signature)) {
        throw 'bad-jwt';
    }
    let payload = JSON.parse(decodeString(encodedPayload));
    return payload;
}

function verifyIntegrity(encodedHeader, encodedPayload, signature) {
    return generateSignature(encodedHeader, encodedPayload) === signature;
}

function generateSignature(encodedHeader, encodedPayload) {
    let dataToHash = `${encodedHeader}.${encodedPayload}`;
    let hashedData = hash(dataToHash);
    return encodeObject(hashedData);
}

function hash(data) {
    let secret = secretFile.JWTHashSecret;
    return hmacSHA256(data, secret);
}

function encodeObject(obj) {
    return encodeString(JSON.stringify(obj));
}

function encodeString(str) {
    return Buffer.from(str).toString('base64');
}

function decodeString(str) {
    return Buffer.from(str, 'base64').toString();
}

module.exports = {
    addCookieIfNeeded,
    getUserIDfromCookie,
    createJWT
};