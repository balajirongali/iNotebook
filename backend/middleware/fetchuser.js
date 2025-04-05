var jwt = require('jsonwebtoken');
JWT_SECRET="BALAJIrongali$112##";

const fetchuser=(req,res,next)=>{
    //get the user from the jwt token and add id to req body
    const token=req.header('auth-token');
    if(!token){
        res.status(401).send({error:"please authenticate using a valid token"})
    }

    try {
        const data=jwt.verify(token,JWT_SECRET);
        req.user=data.user;

        next();
    } catch (error) {
        res.status(401).send({error:"please authenticate using a valid token"})
    }
}  

module.exports=fetchuser;