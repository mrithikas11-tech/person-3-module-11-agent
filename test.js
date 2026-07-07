import fs from "fs";
import { recommendModule } from "./services/openaiService.js";

const menu = JSON.parse(fs.readFileSync("./data/platformMenu.json", "utf-8"));
const answers = {
  "How many providers are in your practice?": "1",
  "Do you accept insurance?": "No",
};

const result = await recommendModule("ehr", answers, menu);
console.log(JSON.stringify(result, null, 2));