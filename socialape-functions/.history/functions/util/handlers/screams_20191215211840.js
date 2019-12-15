const { db } = require('../admin');

exports.getAllScreams = (request,response) => {
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
};

exports.postOneScream = (request,response) => {
    const newScream = {
          body : request.body.body,
          userHandle: request.user.handle,
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