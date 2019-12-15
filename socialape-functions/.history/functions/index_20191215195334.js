const functions = require('firebase-functions');
const admin = require('firebase-admin');

const app = require('express')();
admin.initializeApp();

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

const db = admin.firestore();

const isEmpty = (string)=>{
  return (string.trim() === '');
}

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email.match(regEx);
}

app.get('/screams',(request,response) => {
       db.collection('screams')
         .orderBy('createdAt', 'desc')
         .get()
         .then(data => {
            let screams = [];
            data.forEach(doc => {
            screams.push({
                screamId: doc.id,
                body : doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt
            });
            });
            return response.json(screams);
         })
         .catch((error)=> console.error(error))
})




app.post('/scream',(request,response) =>{
       const newScream = {
             body : request.body.body,
             userHandle: request.body.userHandle,
             createdAt: new Date().toISOString()
       };
       db.collection('screams')
            .add(newScream)
            .then(doc => {
                 response.json({message : `document ${doc.id} created successuly`});
                         })
            .catch((error) => {
                response.status(500).json({error : 'something went wrong '+error});
                console.error(error);
            });''
});

//sign up route 

app.post('/signup',(request,response)=>{
       const newUser = {
           email: request.body.email,
           password: request.body.password,
           confirmPassword: request.body.confirmPassword,
           handle: request.body.handle
    }
    let errors = {};
    if(isEmpty(newUser.email)) {
      errors.email = "Email must not be empty";
    } else if(!isEmail(newUser.email)) errors.email = "Email must be valid";
    if(isEmpty(newUser.password)) errors.password = "Email must not be empty";
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = "Password must matchs"
    if(isEmpty(newUser.handle)) errors.handle = "User must not be empty";;
    if(Object.keys(errors).length > 0) return response.status(400).json(errors);
       //TODO validate data
    let token,userId;
    db.doc(`/users/${newUser.handle}`)
      .get()
      .then(doc => {
                    if(doc.exists)
                    {
                        return response.status(400).json({message: 'this handle is already taken'});
                    }else
                    {
                    return firebase.auth()
                                   .createUserWithEmailAndPassword(newUser.email,newUser.password);
                    }
                    })
      .then(data => {
                    userId = data.user.uid;
                    return data.user.getIdToken();
      })
      .then(tokenValue => {
        token = tokenValue;
          const userCrendetials = {
            handle: newUser.handle,
            email: newUser.email,
            created: new Date().toISOString(),
            userId:userId
          };
          return  db.doc(`/users/${newUser.handle}`).set(userCrendetials);
                     })
      .then(()=> response.status(201).json({tokenValue}))
      .catch(error=> {
          console.error(error);
          if(error.code=== "auth/email-already-in-use"){
              return response.status(400).json({message : 'email is already taken '})
          }
          response.status(500).json(error)
      });


               
});

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
          .createUserWithEmailAndPassword(user.email,user.password)
          .then(data =>{
            return data.user.getIdToken();
          })
          .then(token=> {
            return response.json({token})
          })
          .catch(error=>{
            console.error(error);
            return response.status(500).json({error : error.code});
          });

})


exports.api = functions.region('europe-west1').https.onRequest(app);