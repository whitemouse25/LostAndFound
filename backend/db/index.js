import mongoose from "mongoose";


//connecting database 
export const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("MongoDB Connected");
    })
    .catch((err)=>{
        console.log(err.message);
    })
}