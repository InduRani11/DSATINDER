const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minlength:3,
    },
    lastName:{
        type:String,
    },
    emailId:{
        type:String,
        required:true,
        // lowercase:true,
        trim:true,
        unique:true 
    },
    password:{
        type:String,
        required:true   
    },
    age:{
        type:Number,
        min:18,
    },
    gender:{
        type:String,
        validate(value){  
            if(!["male","female","other"].includes(value)){
                throw new Error("gender must be male,female or other")
            }       
        }
    },
    photoUrl:{
        type:String,
        default:"https://cdn.vectorstock.com/i/500p/82/33/faceless-woman-placeholder-vector-24138233.jpg"
    },
    about:{
        type:String,
        default:"this is about section"
    },
    skills:{
        type:[String]
    }, 

},{timestamps:true});

// module.exports= mongoose.model('User',userSchema);

const User=mongoose.model('User',userSchema);
module.exports= User;