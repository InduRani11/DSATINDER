const express =require('express');
const {conectDB}=require('./config/database');
const app = express();
const User = require('./models/user');

app.use(express.json());

app.post('/signup',async (req,res)=>{
    const userobj=req.body;
    console.log(userobj);
    // creating a new instance of user model
    const user=new User(userobj);

    try{
        await user.save();
        res.send('User created successfully');
    }catch(err){
        res.status(500).send('Error creating user');
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


conectDB().then(()=>{
    console.log('Database connected');
    app.listen(3000,()=>{
        console.log('Server is running on port 3000');
    });
}).catch((err)=>{
    console.log('Database connection failed',err);
});
