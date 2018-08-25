# NoteIdentifier

I recently began learning to play guitar, and one online resource I have been utilizing is [Justin Guitar's beginner course](https://www.justinguitar.com/). One of the things Justin emphasizes is [training your ear](https://www.justinguitar.com/guitar-lessons/justin-ear-training-exercises-s1-bc-118) so that you can recognize the notes that you hear, giving you the ability to pick up a song without relying on a chord chart from someone else. He recommends two ways of doing this:

>You could try and replicate the lessons that I present here by recording yourself, waiting a few days and then trying to work out the answers, or you could get a friend to play chords and chord sequences for you to work out.

I decided to build a program, NoteIdentifier, to help me play this game by myself.

## Source

This repository hosts the server for NoteIdentifier. It's built with Node and Express and utilizes AWS's [DynamoDB](https://aws.amazon.com/dynamodb/), a NoSQL database. I decided to build this as a serverless application so that I can host it on AWS [Lambda](https://aws.amazon.com/lambda/) which is invoked by AWS [API Gateway](https://aws.amazon.com/api-gateway/). By utilizing these cloud-based services, I do not have to maintain any infrastructure and the application will scale automatically and infinitely.

### Authentication

When an unauthenticated user visits, I assign them an ID and store it in a cookie. This cookie is a [JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519). JWTs allow you to store signed information on the client side. By letting the client hold onto their user ID, I don't have to worry about maintaining any state on the server side. I can also trust (but verify) the JWT that the client passes me because it's signed, which makes users unable to fake their ID. These unauthenticated users can register at any point, at which time the ID they're currently assigned becomes their permanent ID. There are two main benefits to this:

  * A seamless user registration experience, where all actions completed prior to registration are remembered and tracked as if the user had been registered the whole time. 
  * All users can be treated the exact same, as they all have a user ID inside the same type of cookie.

As for the actual log in and registration, I decided to build my own custom authentication system. I did this for the experience and because I do not anticipate anyone using this application besides myself. If I were trying to design a production application, I would use a professional-grade authentication system (and I also wouldn't keep it open source!). 

I based my authentication system on [CrackStation's "Salted Password Hashing: Doing it Right"](https://crackstation.net/hashing-security.htm). Passwords are salted with unique salts and then hashed using HMAC SHA256. By using unique salts, attackers are not able to use lookup tables to crack passwords. I generate the salts using a Cryptographically Secure Pseudo-Random Number Generator via the [csprng npm module](https://www.npmjs.com/package/csprng).

Once a user is authenticated, I store their user ID inside a JWT cookie - just like for unauthenticated users.

