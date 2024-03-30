import { PrismaClient } from "@prisma/client";
import express from "express";
import multer from "multer";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import dotenv from "dotenv";

// Read the .env file
dotenv.config()

// Randomly generates an image name that is a 32 byte hex string
const randImageName = () => crypto.randomBytes(32).toString("hex")

// Creates variables to access the AWS S3 bucket
const BUCKET_NAME = process.env.BUCKET_NAME
const BUCKET_REGION = process.env.BUCKET_REGION
const ACCESS_KEY = process.env.ACCESS_KEY
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY

// Creates an express router for basic LM API functionality 
const lmRouter = express.Router()

// Handles multipart form data using multer.
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// Creates Prisma client
const prisma = new PrismaClient()

const imageName = randImageName()

// Creates an S3 client
const s3 = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
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
    Key: imageName + "." + req.file.mimetype.split(".")[1],
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  }

  const command = new PutObjectCommand(params)
  await s3.send(command)

  const imageData = await prisma.photo.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      s3Key: imageName + "." + req.file.mimetype.split(".")[1]
    }
  })
  res.send(imageData)
})

lmRouter.get("/api", async (req, res) => {
  try {
    const photos = await prisma.photo.findMany()

    for (let photo of photos) {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: photo.s3Key
      })
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
      photo.s3Url = url
    }
    res.send(photos)

  } catch (error) {
    console.error(error)
  }
})

export { lmRouter }
