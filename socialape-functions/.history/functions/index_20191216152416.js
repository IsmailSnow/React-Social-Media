const functions = require('firebase-functions');
const app = require('express')();

const {FBAuth} = require('./util/fbAuth')

const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  likeScream,
  unlikeScream
} = require('./util/handlers/screams');

const {
  signup,
  login,
  addUserDetails,
  uploadImage,
  getAuthenticatedUser
} = require('./util/handlers/users');

//Scream Route
app.get('/screams', getAllScreams);
app.post('/scream',FBAuth,postOneScream);
app.get('/scream/:screamId',getScream);
app.post('/scream/:screamId/comment',FBAuth,commentOnScream);
app.get('/scream/:screamId/like',FBAuth,likeScream);
app.get('/scream/:screamId/unlike',FBAuth,unlikeScream);

//User Route
app.post('/user/image',FBAuth,uploadImage);
app.post('/user',FBAuth,addUserDetails);
app.get('/user',FBAuth,getAuthenticatedUser);
//sign up route 
app.post('/signup',signup);
app.post('/login',login);



exports.api = functions.region('europe-west1').https.onRequest(app);