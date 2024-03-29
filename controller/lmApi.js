import { PrismaClient } from "@prisma/client";
import express from "express";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

// Read the .env file
dotenv.config()

// Creates variables to access the AWS S3 bucket
const BUCKET_NAME = process.env.BUCKET_NAME
const BUCKET_REGION = process.env.BUCKET_REGION
const ACCESS_KEY = process.env.ACCESS_KEY
const SECRET_KEY = process.env.SECRET_KEY

// Creates an express router for basic LM API functionality 
const lmRouter = express.Router()

// Handles multipart form data using multer.
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// Creates Prisma client
const prisma = new PrismaClient()

// Creates an S3 client
const s3 = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
  region: BUCKET_REGION
})

// API route for uploading images
lmRouter.post("/api", upload.single("image"), async (req, res) => {
  console.log("req.body", req.body)
  console.log("req.file", req.file)

  req.file.buffer

  const params = {
    Bucket: BUCKET_NAME,
    Key: req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype
  }

  const command = new PutObjectCommand(params)
  await s3.send(command)

  res.send({})
})

lmRouter.get("/api", async (req, res) => {
  try {

  } catch (error) {

  }
})

export { lmRouter }
