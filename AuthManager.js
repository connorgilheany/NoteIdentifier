const hmacSHA256 = require('crypto-js/hmac-sha256');
const secretFile = require('./secrets/hash');


function addCookieIfNeeded(req, res, next) {
    if(!req.cookies.ni_auth) {
        req.app.locals.user = uuid();
        console.log(`Adding cookie for user: ${req.app.locals.user}`);
        res.cookie('ni_auth', createJWT(req.app.locals.user));
    }
    next();
}

function getUserIDfromCookie(req, res, next) {
    if(req.cookies.ni_auth) {
        console.log(`Cookie present! JWT: ${req.cookies.ni_auth}`);
        let payload = decodeJWT(req.cookies.ni_auth);
        console.log(`JWT decoded, userID: ${payload.userID}`);
        req.app.locals.user = payload.userID;
    }
    next();
}

function createJWT(userID) {
    let encodedHeader = this.encodeObject({
        "typ": "JWT",
        "alg": "HS256"
    });
    let encodedPayload = this.encodeObject({
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
    // let header = decodeString(encodedHeader);
    let payload = decodeString(encodedPayload);
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
    let secret = secretFile.hashSecret;
    return hmacSHA256(data, secret);
}

function encodeObject(obj) {
    return this.encodeString(JSON.stringify(obj));
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