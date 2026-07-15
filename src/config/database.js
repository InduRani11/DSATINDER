const mongoose=require('mongoose');

main().then(() => 
    {
        console.log("Connected to MongoDB")
    }
).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://indu9999:UUHjjtJuwMKnKpJN@indu.iei7i6b.mongodb.net/');
}