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


const sendEmail = require("../utils/sendEmail");
const Otp = require("../models/Otp");

// Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.create({ email, otp });
  await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);

  res.json({ success: true, msg: "OTP sent" });
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const record = await Otp.findOne({ email, otp });

  if (!record) return res.status(400).json({ success: false, msg: "Invalid OTP" });

  res.json({ success: true, msg: "OTP verified" });
});


// Forgot Password: Send OTP to Email
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP to DB
  await Otp.create({ email, otp });

  // Send OTP via Email
  await sendEmail(email, "Reset Password OTP", `Your OTP is: ${otp}`);

  res.json({ success: true, msg: "OTP sent to your email" });
});

// Reset Password: Verify OTP and Update Password
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Check OTP
  const record = await Otp.findOne({ email, otp });
  if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const secPass = await bcrypt.hash(newPassword, salt);

  // Update user's password
  await User.findOneAndUpdate({ email }, { password: secPass });

  res.json({ success: true, msg: "Password reset successful" });
});


module.exports=router