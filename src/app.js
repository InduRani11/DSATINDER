const express =require('express');
const {conectDB}=require('./config/database');
const app = express();
const User = require('./models/user');
const {validateSignupData}=require("./utils/validation");
const bycrypt = require('bcrypt');
app.use(express.json());


app.post('/signup',async (req,res)=>{
    // validate the request body
    try{
        validateSignupData(req);
        const {firstName,lastName,emailId,password}=req.body;
        const passwordHash=await bycrypt.hash(password,10);

        const user=new User({
            firstName,
            lastName,
            emailId,
            password:passwordHash
        });

        await user.save();
        res.send('User created successfully');
    }catch(err){
        res.status(500).send('Error creating user:'+err.message);
    }
    
});

app.post('/login',async (req,res)=>{
    try{
        const {emailId,password}=req.body;
        const user=await User.findOne({emailId});
        if(!user){
            return res.status(401).send('Invalid email or password');
        }
        const isPasswordValid= await bycrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(401).send('Invalid email or password');
        }else{
            res.send('User logged in successfully');
        }
    }catch(err){
        res.status(500).send('Error logging in user:'+err.message);
    }
});

// get user by email
app.get('/user',async (req,res)=>{
    const userEmail=req.body.emailId;
    try{
        const user=await User.find({emailId  :userEmail});
        if(user.length===0){
            return res.status(404).send('User not found');
        }else{
            res.send(user);
        }
    } catch(err){
        res.status(500).send('Error fetching user');
    }
}); 

// feed api - GET /feed - get all data of user from database
app.get('/feed',async (req,res)=>{
    try{
        const users=await User.find({});
        res.send(users);
    } catch(err){
        res.status(500).send('Error fetching users');
    }
});
app.delete('/user',async (req,res)=>{
    const id=req.body.id;
    try{
       const user=await User.findByIdAndDelete(id);
      if(user.length===0){
        return res.status(404).send('User not found');
      } 
      else{
        res.send('User deleted successfully');
      } 
    }catch(err){
        res.status(500).send('Error deleting user');
    }     
});

app.patch('/user/:userId',async (req,res)=>{ 
// app.patch('/user',async (req,res)=>{
    try{
        // const id=req.query.id;
        const id=req.params?.userId;
        const update=req.body;
        const ALLOWED_UPDATES=[
            'photoUrl','about','skills','gender','age'
        ];

        const isUpdateAllowed=Object.keys(update).every((updateKey)=>{
            return ALLOWED_UPDATES.includes(updateKey);
        });

        if(!isUpdateAllowed){
            throw new Error('Invalid updates');
        }
        const user=await User.findByIdAndUpdate(id,update,{
            returnDocument:'after',
            runValidators:true
        });
        if(!user){
            return res.status(404).send('User not found');
        }
        res.send(user);
    }catch(err){
        res.status(500).send('Error updating user'+err.message  );
    }
});

conectDB().then(()=>{
    console.log('Database connected');
    app.listen(3000,()=>{
        console.log('Server is running on port 3000');
    });
}).catch((err)=>{
    console.log('Database connection failed',err);
});
