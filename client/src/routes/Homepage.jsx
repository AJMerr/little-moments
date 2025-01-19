import React, { useEffect, useState } from "react"
import axios from "axios"

function Homepage() {
  const [file, setFile] = useState()
  const [title, setTitle] = useState()
  const [description, setDescription] = useState()
  const [images, setImages] = useState([])

  useEffect(() => {
    const fetchAllImages = async () => {
      try {
        const res = await axios.get("/api/")
        setImages(res.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchAllImages()
  }, [])

  const submit = async event => {
    event.preventDefault()

    const formData = new FormData();
    formData.append("image", file)
    formData.append("title", title)
    formData.append("description", description)
    await axios.post("/api/", formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  }

  return (
    <div>
      <form onSubmit={submit}>
        <input onChange={e => setFile(e.target.files[0])} type="file" accept="image/*"></input>
        <input value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder='Title'></input>
        <input value={description} onChange={e => setDescription(e.target.value)} type="text" placeholder='Description'></input>
        <button type="submit">Submit</button>
      </form>

      {images.map((val, key) => {
        return (
        <div>
            <img src={val.s3Url} alt="test" key={key} height="800" width="600"/>
            <h3>{val.title}</h3>
            <p>{val.description}</p>
        </div>
        )
      })}

    </div>
  )
}

export default Homepage