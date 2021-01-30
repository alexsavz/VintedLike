const express = require('express');
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require('cloudinary').v2;
const isAuthenticated = require('../Middlewares/isAuthenticated');

// Cloudinary config

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

// Model import
const User = require('../Models/User');
const Offer = require('../Models/Offer');

// ROUTES
// CRYPTO
router.post('/user/signup', async (req, res) => {
    //console.log(req.fields);
    // {
    //     email: 'brice@lereacteur.io',
    //     username: 'Brice',
    //     phone: '0606060606',
    //     password: 'azerty'
    //   }
    const password = req.fields.password;
    const salt = uid2(64);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(64);
try {
    
    if(req.fields.username)
    {
        const newUser = new User ({
        email : req.fields.email,
        account : {
            username : req.fields.username,
            phone : req.fields.phone
        },
        token : token,
        hash : hash,
        salt : salt,
    });

    // if(req.files.picture.path){
    //     const pictureToUpload = req.files.picture.path;
    //     const result = await cloudinary.uploader.upload(pictureToUpload, {
    //         folder: `/Users/avatar/${newUser.id}`,
    //         public_id: req.fields.username,
    //       });
    //     newUser.avatar = result;
    // }
    

    await newUser.save();
    res.status(200).json(newUser);
}
    else{
        res.status(400).json({message : "Complete your username field PLS"})
    }
} catch (error) {
    res.status(400).json({message : error.message})
}
    
});

router.post('/user/login', async (req, res) => {
    const {email, password} = req.fields;
    try {
        const getUser = await User.findOne({email : req.fields.email});
        // console.log(getUser);
        // {
        //     account: { username: 'Alex', phone: '0602909606' },
        //     _id: 5f9c3d68b731245e888e09a7,
        //     email: 'alex@savina.fr',
        //     token: 'SJgwNOCL9IVo4vXvHEOh48kXiv9SjDmoCRCXOF4NDs77NcXlaAHZb4VAJYpUtUKR',
        //     hash: 'lvRcY9WZJfvdYMwJ7MJwvqTRrmVnM+Gc6raT82OfTRk=',
        //     salt: 'Oj2P1ujC8TFRQSGMjgwxCXdFNbGzRKTFqPGOcNFLzHQcQfh8CsJsY3StGrPwaUXe',
        //     __v: 0
        //   }
        if(getUser){
            const hashToCompare = SHA256(password + getUser.salt).toString(encBase64);

            if(hashToCompare === getUser.hash){
                res.status(400).json({
                    _id: getUser.id,
                    token: getUser.token,
                    account: {
                      username: getUser.account.username,
                      phone: getUser.account.phone
                    }
            });
            }
            else{
                res.status(400).json({message : "Unauthorized"});
            }
        }
        else{
            res.status(400).json({message : "Unauthorized"});
        }
        
    } catch (error) {
        res.status(400).json({message : error.message});
    }
    res.json({message : "routed"});
});

//AUTH

router.post('/offer/publish', isAuthenticated, async (req, res) => {
// console.log(req.headers);
// {
//     authorization: 'Bearer SJgwNOCL9IVo4vXvHEOh48kXiv9SjDmoCRCXOF4NDs77NcXlaAHZb4VAJYpUtUKR',
//     'user-agent': 'PostmanRuntime/7.26.5',
//     accept: '*/*',
//     'postman-token': 'b2512855-19e2-47ff-8f02-bf2421a6a3d1',
//     host: 'localhost:3000',
//     'accept-encoding': 'gzip, deflate, br',
//     connection: 'keep-alive',
//     'content-type': 'multipart/form-data; boundary=--------------------------190729886459636449596371',  
//     'content-length': '343'
//   }
// console.log(req.files);
// console.log(req.files.picture.path);
// C:\Users\alexs\AppData\Local\Temp\upload_6644559c8e83739fa36620d4155fc845
console.log("On rentre dans la route...");
console.log("Le user qui fait la requête : ", req.user);
try {
    // FILES
    const pictureToUpload = req.files.picture.path;

    // CREATE 
    const offer = new Offer({
        product_name: req.fields.title,
        product_description: req.fields.description,
        product_price: req.fields.price,
        product_details: [        {
            MARQUE: req.fields.brand
        },
        {
            TAILLE: req.fields.size
        },
        {
            ETAT: req.fields.condition
        },
        {
            COULEUR: req.fields.color
        },
        {
            EMPLACEMENT: req.fields.city
        }],
        owner: req.user
    });

    const result = await cloudinary.uploader.upload(pictureToUpload, {
        folder: `/vinted/offers/${offer.id}`,
        public_id: req.fields.title,
      });
    offer.product_image = result;

    await offer.save();

    res.status(200).json(offer);
} catch (error) {
    res.status(400).json({error : error.message});  
}
});

router.put('/offer/update', async (req, res) => {
 
    const {
        id,
        title,
        description,
        price,
        condition,
        city,
        brand,
        size,
        color,
      } = req.fields;
    
      const details = [brand, size, condition, color, city];

    //console.log(brand, size, condition, color, city);
    try {
        const offerToUpdate = await Offer.findById(req.fields.id);
        //A.findByIdAndUpdate(id, update, options, callback)
        if(req.fields.id && req.fields.title){
            offerToUpdate.product_name = title;
        }
        else if(id && description){
            offerToUpdate.product_description = description;
        }
        else if(id && price){
            offerToUpdate.product_price = price;
        }
        else if(id && owner){
            offerToUpdate.owner = owner
        }
        // update de product_details
        
        offerToUpdate.product_details.forEach((e,i) => {
            if(id && details[i]){
                for (let key in e) {
                    if (e.hasOwnProperty(key)) {
                      e[key] = details[i]
                    }
                  }
            }
        });

            await offerToUpdate.save();
            res.status(200).json(offerToUpdate);
    } catch (error) {
        res.status(400).json({message : error.message});
    }
});

router.delete('/offer/delete', async (req, res) => {
    try {
        if(req.fields.id){
            const offerToDelete = await Offer.findById(req.fields.id);
            await offerToDelete.deleteOne();
            res.status(200).json({message : 'You deleted one offer.'})
        }
        else{
            res.status(400).json({message : error.message});
        }
        
    } catch (error) {
        res.status(400).json({message : error.message});
    }
});

module.exports = router;

// CONSOLE
// {
//     product_details: [
//       { MARQUE: 'Nike' },
//       { TAILLE: '44' },
//       { 'ÉTAT': 'neuf' },
//       { COULEUR: 'Blue' },
//       { EMPLACEMENT: 'Paris' }
//     ],
//     _id: 5f9d8c61a527c73e54a9b160,
//     product_name: 'Air Max 90',
//     product_description: 'presque neuves',
//     product_price: 80,
//     product_image: {
//       picture: {
//         _eventsCount: 0,
//         _maxListeners: null,
//         size: 35514,
//         path: 'C:\\Users\\alexs\\AppData\\Local\\Temp\\upload_c68ca8a1325622bd695bf36e5ac7b104',
//         name: 'nike-air-max-90-blue-cork-cw6208-414-pic01.jpg',
//         type: 'image/jpeg',
//         hash: null,
//         lastModifiedDate: 2020-10-31T16:10:05.016Z,
//         _writeStream: [Object]
//       }
//     },
//     owner: 5f9c3d68b731245e888e09a7,
//     __v: 0
//   }