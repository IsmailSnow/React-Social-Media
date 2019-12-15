const { db } = require('../admin');

const firebase = require('firebase');

const config = require('../config');
firebase.initializeApp(config);

const {
  validateSignupData,
  validateLoginData
} = require('../util/validators');


exports.signup = (request,response)=>{
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


            
};

exports.login = (request,response)=>{
    const user = {
      email : request.body.email,
      password : request.body.password
    };
  
    let errors = {};
    if(isEmpty(user.email)) errors.email = "Email must not be empty";
    if(isEmpty(user.password)) errors.password = "Email must not be empty";
  
    if(Object.keys(errors).length > 0) return response.status(400).json(errors);
  
    firebase.auth()
            .signInWithEmailAndPassword(user.email,user.password)
            .then(data =>{
              return data.user.getIdToken();
            })
            .then(token=> {
              return response.json({token})
            })
            .catch(error=>{
              console.error(error);
              if(error.code === 'auth/wrong-password'){
                return response.status(400).json({message : 'wrong password , please try again '})
              }
              return response.status(500).json({error : error.code});
            });
  
  };