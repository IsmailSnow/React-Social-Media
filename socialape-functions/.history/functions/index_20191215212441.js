const functions = require('firebase-functions');
const app = require('express')();
const {
  getAllScreams, postOneScream
} = require('./util/handlers/screams');

const {
  signup
} = require('./util/handlers/users');


const firebaseConfig = {
    apiKey: "AIzaSyD1TK3sZJaZT4yvC7baNLv3nCA_V16be2g",
    authDomain: "socialape-d31f9.firebaseapp.com",
    databaseURL: "https://socialape-d31f9.firebaseio.com",
    projectId: "socialape-d31f9",
    storageBucket: "socialape-d31f9.appspot.com",
    messagingSenderId: "1075126438960",
    appId: "1:1075126438960:web:c673f636508c06312271f5",
    measurementId: "G-NKLJLNSS21"
  };

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

app.post('/login',(request,response)=>{
  const user = {
    email : request.body.email,
    password : request.body.password
  };

  let errors = {};
  if(isEmpty(user.email)) errors.email = "Email must not be empty";
  if(isEmpty(user.password)) errors.password = "Email must not be empty";

  if(Object.keys(errors).length > 0) return response.status(400).json(errors);

  firebase.auth()
          .signInWithEmailAndPassword(user.email,user.password)
          .then(data =>{
            return data.user.getIdToken();
          })
          .then(token=> {
            return response.json({token})
          })
          .catch(error=>{
            console.error(error);
            if(error.code === 'auth/wrong-password'){
              return response.status(400).json({message : 'wrong password , please try again '})
            }
            return response.status(500).json({error : error.code});
          });

})


exports.api = functions.region('europe-west1').https.onRequest(app);