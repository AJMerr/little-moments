import express from "express";

const app = express()

const PORT = process.env.port || 8080

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
