import { PrismaClient } from "@prisma/client";
import express from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

// Read the .env file
dotenv.config()

// Creates variables to access the AWS S3 bucket
const BUCKET_NAME = process.env.BUCKET_NAME
const BUCKET_REGION = process.env.BUCKET_REGION
const ACCESS_KEY = process.env.ACCESS_KEY
const SECRET_KEY = process.env.SECRET_KEY

const lmRouter = express.Router()

const prisma = new PrismaClient()

const s3 = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
  region: BUCKET_REGION
})

const params = {
  Bucket: BUCKET_NAME,
  Key: request.file.originalname,
  Body: request.file.buffer,
  ContentType: request.file.mimetype
}

const command = new PutObjectCommand(params)
await s3.send(command)

lmRouter.get("/api", async (req, res) => {
  try {

  } catch (error) {

  }
})

