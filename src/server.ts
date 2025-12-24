import { app } from './app'
import { connectMongo } from "./config/db";

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await connectMongo();
        app.listen(PORT, () => {
            console.log(`Server is listening on: ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
    }
})();
