const User = require("../Models/User");

const isAuthenticated = async (req, res, next) => {
    console.log(req.headers.authorization);
    const tokenToFind = req.headers.authorization.replace("Bearer ", "");
    if(req.headers.authorization){
        const AuthenticatedUser = await User.findOne({token : tokenToFind});
        console.log(AuthenticatedUser);
        
        if(AuthenticatedUser){  
            req.user = AuthenticatedUser;
            return next();
        }
        else{
            return res.status(401).json({error : "Unauthorized"});
        }
    }
    else{
        return res.status(401).json({error : "Unauthorized"});
    }
};

module.exports = isAuthenticated;

// CONSOLE 
// Bearer SJgwNOCL9IVo4vXvHEOh48kXiv9SjDmoCRCXOF4NDs77NcXlaAHZb4VAJYpUtUKR
// {
//   account: { username: 'Alex', phone: '0602909606' },
//   _id: 5f9c3d68b731245e888e09a7,
//   email: 'alex@savina.fr',
//   token: 'SJgwNOCL9IVo4vXvHEOh48kXiv9SjDmoCRCXOF4NDs77NcXlaAHZb4VAJYpUtUKR',
//   hash: 'lvRcY9WZJfvdYMwJ7MJwvqTRrmVnM+Gc6raT82OfTRk=',
//   salt: 'Oj2P1ujC8TFRQSGMjgwxCXdFNbGzRKTFqPGOcNFLzHQcQfh8CsJsY3StGrPwaUXe',
//   __v: 0
// }