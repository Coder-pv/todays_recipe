import "dotenv/config";
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5000;
const app = createApp();

await connectDB();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
