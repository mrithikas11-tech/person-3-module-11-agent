import express from "express";
import cors from "cors";
import apiRoutes from "./routes/apiRoutes.js";

const app = express();
const PORT = 3001;

app.use(cors());          // let the frontend talk to us
app.use(express.json());  // read JSON bodies

app.use("/api", apiRoutes); // /api/recommend-module and /api/assemble-stack

app.get("/", (req, res) => res.send("Telehealth advisor backend is running."));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));