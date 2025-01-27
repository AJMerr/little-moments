import express from "express";
import { lmRouter } from "./controller/lmApi.js"
import cors from "cors"

const app = express()

// Middleware
app.use(cors())

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use("/", lmRouter)

const PORT = process.env.port || 8080

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
