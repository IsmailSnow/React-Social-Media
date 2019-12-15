import { db } from '../util/admin';


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