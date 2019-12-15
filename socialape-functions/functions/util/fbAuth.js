const { admin, db } = require('../util/admin');

exports.FBAuth = (request, response , next) => {
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