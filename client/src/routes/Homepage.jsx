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
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={submit} className="max-w-md mx-auto mb-12 p-6 bg-white rounded-lg shadow-md">
        <div className="space-y-4">
          <input 
            onChange={e => setFile(e.target.files[0])} 
            type="file" 
            accept="image/*"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            type="text" 
            placeholder='Title'
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            type="text" 
            placeholder='Description'
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <button 
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((val, key) => {
          return (
            <div key={key} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={val.s3Url} 
                alt="test" 
                className="w-full h-[400px] object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{val.title}</h3>
                <p className="text-gray-600 mb-4">{val.description}</p>
                <button 
                  onClick={() => handleDelete(val.id)}
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Homepage