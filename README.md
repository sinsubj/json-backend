# Json-backend Server

API server for a modified version of [Hackafy](https://github.com/kenny-hibino/hackafy) (Instagram clone) built with Node.js and jsonwebtoken.

Currently available endpoints are:
* /auth/login - returns a Bearer token
* /posts
* /posts/comments
* /users
* /users/postIds
* /users/likedPostIds

## Install

After cloning this repository, run

```
npm install
npm run start-auth
```

Client side applications, both [Web](https://github.com/kenny-hibino/hackafy) and [Native](https://github.com/kenny-hibino/hackafy-native) are configured to use `localhost:5000` as an API endpoint

## Contribution

Feedbacks, and issue reports are more than welcome :)
