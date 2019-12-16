const { db } = require('../admin');

const firebase = require('firebase');

const config = require('../config');
firebase.initializeApp(config);

const {
  validateSignupData,
  validateLoginData
} = require('../validators');


//sign up
exports.signup = (request, response) => {
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    handle: request.body.handle
  }
  const { valid, errors } = validateSignupData(newUser);
  if (!valid) return res.status(400).json(errors);

  const  noImg = 'no-img.png';


  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return response.status(400).json({ message: 'this handle is already taken' });
      } else {
        return firebase.auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
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
        imageUrl : `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
        userId: userId
      };
      return db.doc(`/users/${newUser.handle}`).set(userCrendetials);
    })
    .then(() => response.status(201).json({ token }))
    .catch(error => {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        return response.status(400).json({ message: 'email is already taken ' })
      }
      response.status(500).json(error)
    });



};

//login
exports.login = (request, response) => {
  const user = {
    email: request.body.email,
    password: request.body.password
  };

  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

  firebase.auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return response.json({ token })
    })
    .catch(error => {
      console.error(error);
      if (error.code === 'auth/wrong-password') {
        return response.status(400).json({ message: 'wrong password , please try again ' })
      }
      return response.status(500).json({ error: error.code });
    });

};

//add User Details
exports.addUserDetails = (request,response) => {


}




exports.uploadImage = (request, response) => {
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os')
  const fs = require('fs');

  const busboy = new BusBoy({ headers: request.headers });
  let imageFileName;
  let imageToBeUploaded = {};
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname);
    console.log(filename);
    console.log(mimetype);

    const imageExtension = filename.split('.')[filename.split('.').length - 1];
    imageFileName = `${Math.round(Math.random() * 100000000)}.${imageExtension}`;
    const filePath = file.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filePath, mimetype };
    file.pipe(fs.createWriteStream(filePath));
  })
  busboy.on('finish', () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
          config.storageBucket
          }/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${request.user.handle}`).update({ imageUrl });
      })
      .then(() => {
        return response.json({ message: 'image uploaded successfully' });
      })
      .catch((err) => {
        console.error(err);
        return response.status(500).json({ error: 'something went wrong' });
      });
  });
  busboy.end(req.rawBody);

};