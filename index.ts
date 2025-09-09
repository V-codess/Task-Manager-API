import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import taskRoutes from "./src/routes/taskManager";
import database from './src/config/connectDB';
import {limiter} from "./src/middlewares/rateLimiter"

dotenv.config()
const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(limiter);

app.get("/", (req, res)=>{
    res.send("use /api to get the routes")
})
app.use("/api", taskRoutes);

const startServer = async() =>{
    try {
        const url: string = process.env.MONGOKEY || "";
        await database(url);
        app.listen(port, () => {
          console.log("Server is running on port 8080");
        });        
    } catch (error) {
        console.log(error)
    }
}
startServer()