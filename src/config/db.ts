import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI){
    throw new Error("MONGO_URI is not defined.")
}

export const connectMongo = async () => {
    const conf = {
        autoIndex: false // disable in production
    }

    try {
        await mongoose.connect(MONGO_URI, conf)

        mongoose.connection.on("connected", () => {
            console.log("MongoDB connected");
        });

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error", err);
        })

        mongoose.connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
        })

        return mongoose;
    } catch (err) {
        console.error("Unexpected error whilst connecting to MongoDB", err);
        process.exit(1);
    }
}