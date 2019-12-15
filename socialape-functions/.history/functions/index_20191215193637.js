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
  return (string.trim()=== '');
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


               
})


exports.api = functions.region('europe-west1').https.onRequest(app);