import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/auth";
import subRoutes from "./routes/subs";
import cors from "cors";
import dotenv from "dotenv";

const app = express();

app.use(express.json());
const origin = process.env.ORIGIN;
dotenv.config();

app.use(morgan("dev"));
app.use(cors({ origin, credentials: true }));
app.use("/auth", authRoutes);
app.use("/subs", subRoutes);
app.get("/", (req, res) => {
  res.send("running!");
});
let port = 4000;

app.listen(port, async () => {
  console.log("listening on port: " + port);
  AppDataSource.initialize()
    .then(() => {
      console.log("data initialized.");
    })
    .catch((error) => console.log(error));
});
