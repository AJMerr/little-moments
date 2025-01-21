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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/${id}`)
      // Refresh the images list after deletion
      const res = await axios.get("/api/")
      setImages(res.data)
    } catch (error) {
      console.error(error)
    }
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
          <div key={key} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
            {val.s3Url && (
              <img src={val.s3Url} alt="test" height="800" width="600"/>
            )}
            <h3>{val.title}</h3>
            <p>{val.description}</p>
            <button 
            onClick={() => handleDelete(val.id)}
            style={{display: 'block', margin: '10px 0'}}
          >
            Delete
          </button>
          </div>
        )
      })}
    </div>
  )
}

export default Homepage