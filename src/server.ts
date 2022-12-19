import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";
const app = express();

app.use(express.json())
app.use(morgan("dev"));
app.get('/', (req, res) => { res.send("running!"); });
let port = 4000;

app.listen(port, async () => {
    console.log("listening on port: " + port);
    AppDataSource.initialize().then(() => {
        console.log("data initialized.")
    
    }).catch(error => console.log(error))
 })
