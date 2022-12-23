import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/auth";
import cors from "cors";
const app = express();

app.use(express.json());
const origin = "http://localhost:3000";

app.use(morgan("dev"));
app.use(cors({ origin }));
app.use("/auth", authRoutes);
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
