import express from "express";

const app = express();

// uses port 8080 if not defined
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})



