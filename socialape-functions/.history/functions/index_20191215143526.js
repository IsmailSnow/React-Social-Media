const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello it's working from firebase!");
});


exports.getScreams = functions.https.onRequest((request,response) => {
     admin.firestore()
          .collection('screams')
          .get().then(data => {
                let screams = [] ;
                data.forEach(doc => {
                screams.push(doc.data());
                })
                return screams.json();
          })
          .catch(error=> console.error(error))
})
