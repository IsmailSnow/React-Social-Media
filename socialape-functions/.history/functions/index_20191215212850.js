const functions = require('firebase-functions');
const app = require('express')();

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

const FBAuth = (request, response , next) => {
  let idToken ;  
  if(request.headers.authorization && request.headers.authorization.startsWith('Bearer ')){
    idToken = request.headers.authorization.split('Bearer ')[1];
    admin.auth()
         .verifyIdToken(idToken)
         .then(decodedToken=>{
            request.user = decodedToken;
            console.log(decodedToken);
            return db.collection('users').where('userId','==',request.user.uid).limit(1).get();
         })
         .then(data=>{
           request.user.handle = data.docs[0].data().handle;
           return next();
         })
         .catch(error=>{
           console.error(error);
           return  response.status(500).json({error : error.code});
         })
  }else{
    console.error("No token found")
    return response.status(403).json({message : ' unauthorized path'});
  }

} 

//Scream Route
app.get('/screams', getAllScreams) 
app.post('/scream',FBAuth,postOneScream)

//sign up route 
app.post('/signup',signup);
app.post('/login',login);


exports.api = functions.region('europe-west1').https.onRequest(app);