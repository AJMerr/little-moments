import { PrismaClient } from "@prisma/client";
import express from "express";
import multer from "multer";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
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

// Creates an S3 client
const s3 = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  region: BUCKET_REGION
})

// API route for creating a new album
lmRouter.post("/api/albums", async (req, res) => {
  try {
    const album = await prisma.album.create({
      data: {
        title: req.body.title,
        description: req.body.description
      }
    })
    res.send(album)
  } catch (error) {
    console.error(error)
    res.status(500).send(error)
  }
})

// API route for getting all albums
lmRouter.get("/api/albums", async (req, res) => {
  try {
    const albums = await prisma.album.findMany({
      include: {
        photos: true
      }
    })
    
    // Get signed URLs for all photos in all albums
    for (let album of albums) {
      for (let photo of album.photos) {
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: photo.s3Key
        })
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
        photo.s3Url = url
      }
    }
    
    res.send(albums)
  } catch (error) {
    console.error(error)
    res.status(500).send(error)
  }
})

// API route for getting a single album
lmRouter.get("/api/albums/:id", async (req, res) => {
  try {
    const id = +req.params.id
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        photos: true
      }
    })
    
    // Get signed URLs for all photos in the album
    for (let photo of album.photos) {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: photo.s3Key
      })
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
      photo.s3Url = url
    }
    
    res.send(album)
  } catch (error) {
    console.error(error)
    res.status(500).send(error)
  }
})

// API route for adding photos to an album
lmRouter.post("/api/albums/:id/photos", async (req, res) => {
  try {
    const albumId = +req.params.id
    const photoIds = req.body.photoIds // Array of photo IDs to add

    const album = await prisma.album.update({
      where: { id: albumId },
      data: {
        photos: {
          connect: photoIds.map(id => ({ id: +id }))
        }
      },
      include: {
        photos: true
      }
    })
    res.send(album)
  } catch (error) {
    console.error(error)
    res.status(500).send(error)
  }
})

// Modify existing photo upload to include optional albumId
lmRouter.post("/api", upload.single("image"), async (req, res) => {
  const imageName = randImageName(req.file.originalname)
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: imageName + "." + req.file.mimetype.split("/")[1],
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  }

  const command = new PutObjectCommand(params)
  await s3.send(command)

  const imageData = await prisma.photo.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      s3Key: imageName + "." + req.file.mimetype.split("/")[1],
      ...(req.body.albumId && {
        albums: {
          connect: { id: +req.body.albumId }
        }
      })
    }
  })
  res.send(imageData)
})

// API route for getting all images
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

// API route to get an image by ID
lmRouter.get("/api/:id", async (req, res) => {
  try {
    const id = +req.params.id
    const singlePhoto = await prisma.photo.findUnique({ where: { id }})

    // Gets the singed URL from S3 for a single image
    const command = new GetObjectCommand ({
      Bucket: BUCKET_NAME,
      Key: singlePhoto.s3Key
    })
    
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
    singlePhoto.s3Url = url

    // Sends back the single photo's metadata + the signed URL for the image from S3.
    res.send(singlePhoto)

  } catch (error) {
    console.error(error)
  }
})

// API route for updating an image
lmRouter.put("/api/:id", async (req, res) => {
  try {
    const id = +req.params.id
    const { title, description, albumId } = req.body

    // Update photo with album connection/disconnection
    const updatedPhoto = await prisma.photo.update({
      where: { id },
      data: {
        title,
        description,
        albums: {
          // If albumId is null/empty, disconnect all albums
          // If albumId exists, connect to that album and disconnect others
          ...(albumId 
            ? {
                set: [], // First disconnect all existing albums
                connect: { id: +albumId } // Then connect to the new album
              }
            : {
                set: [] // Just disconnect all albums if no albumId provided
              }
          )
        }
      },
      include: {
        albums: true // Include albums in the response
      }
    })

    res.send(updatedPhoto)

  } catch (error) {
    console.error(error)
    res.status(500).send(error)
  }
})

// API route for deleting an image
lmRouter.delete("/api/:id", async (req, res) => {
  try {
    const id = +req.params.id
    const photo = await prisma.photo.findUnique({ where: { id } })

    const s3DeleteParams = {
      Bucket: BUCKET_NAME,
      Key: photo.s3Key
    }

    // Delete image from S3 first
    await s3.send(new DeleteObjectCommand(s3DeleteParams))

    // Then delete from database
    const deletedPhoto = await prisma.photo.delete({ where: { id } })
    
    res.send(deletedPhoto)

  } catch (error) {
    console.error(error)
  }
})

export { lmRouter }
