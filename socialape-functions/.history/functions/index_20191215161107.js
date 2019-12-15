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

// with pure javascript
//exports.getScreams = functions.https.onRequest((request,response) => {
//});

app.get('/screams',(request,response) => {
    admin.firestore()
         .collection('screams')
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
       admin.firestore()
            .collection('screams')
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
       firebase.auth()
               .createUserWithEmailAndPassword(newUser.email, newUser.password)
               .then( data => {
                           response.status(201).json({message : `user ${data.user.uid} signed up successufly`})
               .catch(error=> {
                   console.log(error);
                   response.status(500).json({error : error.message})
               });            
       })

})


exports.api = functions.region('europe-west1').https.onRequest(app);