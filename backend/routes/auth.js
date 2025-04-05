const express=require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router=express.Router()
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var fetchuser=require('../middleware/fetchuser')

JWT_SECRET="BALAJIrongali$112##";

//ROUTE 1:create a user using POST "/api/auth/createuser". No login required
router.post('/createuser',[
    body('name','enter a valid name').isLength({min:3}),
    body('email','enter a valid email').isEmail(),
    body('password','password should be atleast 5 characters').isLength({min:5})
    ],async (req,res)=>{
      let success=false;
      //if there are errors return bad request
    const result = validationResult(req);
    if (!result.isEmpty()) {
    return res.status(400).json({ success,errors: result.array() });
  }
  //check whether the user with this email exists or not 
  try{
  let user=await User.findOne({email:req.body.email});
  if(user){
    return res.status(400).json({success,error:"sorry a user with this email exists!"})
  }

  const salt=await bcrypt.genSalt(10);
  const secPass=await bcrypt.hashSync(req.body.password, salt);
  //create a new user
  user=await User.create({
    name:req.body.name,
    email:req.body.email,
    password:secPass
  })

  const data={
    user:{
      id:user.id
    }
  }
  
  const authtoken=jwt.sign(data,JWT_SECRET);
  // console.log(jwtData)
  success=true;
  res.json({success,authtoken})
  }
  catch(error){
    console.log(error.message);
    res.status(500).send("some error occured");
  }
  
  // .then(User=>res.json(User))
  // .catch(err=>{console.log(err),res.json({error:'please enter correct and unique email ',message:err.message})})

})


//ROUTE 2:Authenticate a user using POST "/api/auth/login". No login required
router.post('/login',[
  
  body('email','enter a valid email').isEmail(),
  body('password','password cannot be blank').exists()
 
  ],async (req,res)=>{
    let success=false;
    //if there are errors,return Bad request and the errors
    const result = validationResult(req);
    if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
    }

    const {email,password}=req.body;
    try{
      let user=await User.findOne({email});
      if(!user){
        success=false
        return res.status(400).json({error:"please try to login with correct credentials"});

      }
      const passwordcmp=await bcrypt.compare(password,user.password);
      if(!passwordcmp){
        success=false
        return res.status(400).json({success,error:"please try to login with correct credentials"});
      }

      const data={
        user:{
          id:user.id
        }
      }
      
      const authtoken=jwt.sign(data,JWT_SECRET);
      success=true;
      res.json({success,authtoken})

    }catch(error){
      console.log(error.message);
      res.status(500).send("Internal server occured");
    }

})


//ROUTE 3:get loggedin use Details using POST "/api/auth/getuser".  login required
router.post('/getuser',fetchuser,async (req,res)=>{
try {
  userId=req.user.id;
  const user=await User.findById(userId).select("-password");
  res.send(user);
} catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server occured");
}
})

module.exports=router