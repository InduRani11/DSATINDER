const mongoose=require('mongoose');


async function conectDB() {
  await mongoose.connect('mongodb+srv://indu9999:UUHjjtJuwMKnKpJN@indu.iei7i6b.mongodb.net/devTinder');
}

module.exports={
    conectDB,
};