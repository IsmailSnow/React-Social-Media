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
          userImage: request.user.imageUrl,
          createdAt: new Date().toISOString(),
          likeCount:0,
          commentCount:0
    };
    db.collection('screams')
         .add(newScream)
         .then(doc => {
              const resScream = newScream;
              resScream.screamId = doc.id;
              response.json(resScream);
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
         screamData=doc.data();
         screamData.screamId= doc.id;
         return db.collection('comments')
                  .orderBy('createdAt','desc')
                  .where('screamId','==',request.params.screamId)
                  .get();
     }).then(data=>{
        screamData.comments = [];
        data.forEach(doc =>{
            console.log(doc.data());
            screamData.comments.push(doc.data());
        });
        return response.json(screamData);
    })
    .catch(error=>{
        console.error(error);
        response.status(500).json({error:error.code});
    });

};

exports.commentOnScream = (request,response)=>{
  if(request.body.body.trim() === ''){
      return response.status(400).json({message: 'Must not be empty'});
  }
  const newComment = {
      body: request.body.body,
      createdAt: new Date().toISOString(),
      screamId: request.params.screamId,
      userHandle: request.user.handle,
      userImage: request.user.imageUrl
  }

  db.doc(`/screams/${request.params.screamId}`)
    .get()
    .then(doc =>{
        if(!doc.exists){
            return response.status(404).json({error : 'scream not found'})
        }
        return db.collection('comments').add(newComment);
    })
    .then(()=>{
        return response.json(newComment);
    })
    .catch(error=>{
        console.error(error);
        response.status(500).json({error: ' Someting went wrong'});
    });
}

exports.likeScream = (req, res) => {
    const likeDocument = db
      .collection('likes')
      .where('userHandle', '==', req.user.handle)
      .where('screamId', '==', req.params.screamId)
      .limit(1);
  
    const screamDocument = db.doc(`/screams/${req.params.screamId}`);
  
    let screamData;
  
    screamDocument
      .get()
      .then((doc) => {
        if (doc.exists) {
          screamData = doc.data();
          screamData.screamId = doc.id;
          return likeDocument.get();
        } else {
          return res.status(404).json({ error: 'Scream not found' });
        }
      })
      .then((data) => {
        if (data.empty) {
          return db
            .collection('likes')
            .add({
              screamId: req.params.screamId,
              userHandle: req.user.handle
            })
            .then(() => {
              screamData.likeCount++;
              return screamDocument.update({ likeCount: screamData.likeCount });
            })
            .then(() => {
              return res.json(screamData);
            });
        } else {
          return res.status(400).json({ error: 'Scream already liked' });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      });
  };
  
exports.unlikeScream = (req, res) => {
    const likeDocument = db
      .collection('likes')
      .where('userHandle', '==', req.user.handle)
      .where('screamId', '==', req.params.screamId)
      .limit(1);
  
    const screamDocument = db.doc(`/screams/${req.params.screamId}`);
  
    let screamData;
  
    screamDocument
      .get()
      .then((doc) => {
        if (doc.exists) {
          screamData = doc.data();
          screamData.screamId = doc.id;
          return likeDocument.get();
        } else {
          return res.status(404).json({ error: 'Scream not found' });
        }
      })
      .then((data) => {
        if (data.empty) {
          return res.status(400).json({ error: 'Scream not liked' });
        } else {
          return db
            .doc(`/likes/${data.docs[0].id}`)
            .delete()
            .then(() => {
              screamData.likeCount--;
              return screamDocument.update({ likeCount: screamData.likeCount });
            })
            .then(() => {
              res.json(screamData);
            });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      });
  };