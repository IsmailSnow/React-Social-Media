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




const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);



const isEmpty = (string)=>{
  return (string.trim() === '');
}

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email.match(regEx);
}



//Scream Route
app.get('/screams', getAllScreams) 
app.post('/scream',FBAuth,postOneScream)

//sign up route 
app.post('/signup',signup);
app.post('/login',login);


exports.api = functions.region('europe-west1').https.onRequest(app);