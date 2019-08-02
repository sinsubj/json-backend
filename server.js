// https://www.techiediaries.com/fake-api-jwt-json-server/
// load required modules
const fs = require("fs");
const bodyParser = require("body-parser");
const jsonServer = require("json-server");
const jwt = require("jsonwebtoken");

// return an Express server
const server = jsonServer.create();

// return an Express router
const router = jsonServer.router("./db.json");

// read and json-parse the db
let userdb = JSON.parse(fs.readFileSync("./db.json", "UTF-8"));

// set default middlewares (logger, static, cors, and no-cache)
// We have to put body Parser function on top of routes. Otherwise we may come on this error.
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(jsonServer.defaults());

const SECRET_KEY = "123456789"; // used to sign the payloads
const expiresIn = "1h"; // for setting the time of expiration for JWT access tokens

// Create a token from a payload
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Verify the token
function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY, (err, decode) =>
    decode !== undefined ? decode : err
  );
}

// Check if the user exists in database
function isAuthenticated({ email, password }) {
  console.log("isAuthenticated; userdb.users:", userdb.users);
  return (
    userdb.users.findIndex(
      user => user.email === email && user.password === password
    ) !== -1
  );
}

// create a POST /auth/login endpoint which verifies if the user exists
// in the database and then create and send a JWT token to the user
server.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  console.log("/auth/login; req.body:", req.body);

  if (isAuthenticated({ email, password }) === false) {
    const status = 401;
    const message = "Incorrect email or password";
    res.status(status).json({ status, message });
    return;
  }
  const authenticationToken = createToken({ email, password });
  const userIndex = userdb.users.findIndex(user => user.email === email);
  const userData = userdb.users[userIndex];
  console.log("/auth/login; userData", userData);
  res.status(200).json({
    user: { authenticationToken, ...userData }
  });
});

/*
 * Add an Express middleware that checks that the authorization header
 * has the Bearer scheme, then verifies if the token is valid for all routes
 * except the previous route since this is the one we use to login the user
 */
server.use(/^(?!\/auth).*$/, (req, res, next) => {
  console.log("/auth; req: ", req.headers);
  if (
    req.headers.authorization === undefined ||
    req.headers.authorization.split(" ")[0] !== "Bearer"
  ) {
    const headers = req.headers;
    const status = 401;
    const message = "Error in authorization format";
    console.log("/auth;", message);
    res.status(status).json({ headers, status, message });
    return;
  }
  try {
    verifyToken(req.headers.authorization.split(" ")[1]);
    console.log("/auth; token verified; req.body: ", req.body);

    // Reload user data
    userdb = JSON.parse(fs.readFileSync("./db.json", "UTF-8"));
    next();
  } catch (err) {
    const status = 401;
    const message = "Error access_token is revoked";
    console.log("/auth;", message);
    res.status(status).json({ status, message });
  }
});

// Finally mount json-server then run server on the specified port
server.use(router);
server.listen(2019, () => {
  console.log("Run Auth API Server");
});
