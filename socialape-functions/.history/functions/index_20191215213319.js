const functions = require('firebase-functions');
const app = require('express')();

const {FBAuth} = require('./util/fbAuth')

const {
  getAllScreams,
  postOneScream
} = require('./util/handlers/screams');

const {
  signup,
  login
} = require('./util/handlers/users');

//Scream Route
app.get('/screams', getAllScreams) 
app.post('/scream',FBAuth,postOneScream)

//sign up route 
app.post('/signup',signup);
app.post('/login',login);


exports.api = functions.region('europe-west1').https.onRequest(app);