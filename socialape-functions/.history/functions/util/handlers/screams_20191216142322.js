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
         });
};

exports.getScream = (request,response) => {

   let screamData = {};
   db.doc(`/screams/${request.params.screamId}`)
     .get()
     .then(doc=>{
         if(!doc.exists){
          return response.status(404).json({message : 'Scream not found'}) 
         }
         screamData- doc.data();
         screamData.screamId= doc.id;
         return db.collection('comments')
                  .where('screamId','==',request.params.screamId)
                  .get()
     }).then(data=>{
        screamData.comments = [];
        data.forEach(doc =>{
            screamData.comments.push(doc.data());
        });
        return response.json(screamData);
    })
    .catch(error=>{
        console.error(error);
        response.status(500).json({error:error.code});
    });

};