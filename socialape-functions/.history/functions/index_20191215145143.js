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
                let screams = [];
                data.forEach(doc => {
                screams.push(doc.data());
                });
                return response.json(screams);
          })
          .catch((error)=> console.error(error))
});

exports.createScream = functions.https.onRequest((request,response) =>{
       const newScream = {
             body : request.body.body,
             userHandle: request.body.userHandle,
             createdAt: admin.firestore.Timestamp.fromDate(new Date())
       };
       admin.firestore()
            .collection('screams')
            .add(newScream).
            then(doc => {
                 response.json({message : `document ${doc.id} created successuly`});
                })
            .catch((error) => {
                response.status(500).json({error : 'something went wrong '+error});
                console.error(error);
            })

});
