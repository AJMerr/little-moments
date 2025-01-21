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
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 px-4 py-8 md:px-8 lg:px-16">
      {/* Upload Form */}
      <div className="mb-12 max-w-2xl mx-auto animate-fade-in">
        <h1 className="text-4xl font-bold mb-6 text-neutral-800 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600">
          Image Gallery
        </h1>
        <form onSubmit={submit} className="space-y-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-xl shadow-lg border border-neutral-200/50 p-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">Upload Image</label>
            <input 
              onChange={e => setFile(e.target.files[0])} 
              type="file" 
              accept="image/*"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">Title</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              type="text" 
              placeholder="Enter title"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">Description</label>
            <input 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              type="text" 
              placeholder="Enter description"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-violet-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-violet-700 focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
          >
            Upload Image
          </button>
        </form>
      </div>

      {/* Image Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 max-w-7xl mx-auto space-y-6">
        {images.map((val, key) => (
          <div 
            key={key} 
            className="break-inside-avoid group bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-xl shadow-sm border border-neutral-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img 
                src={val.s3Url} 
                alt={val.title} 
                className="w-full h-full object-cover transition duration-300 ease-out group-hover:scale-105 group-hover:rotate-1"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-neutral-800 mb-1">{val.title}</h3>
              <p className="text-sm text-neutral-600 mb-4">{val.description}</p>
              <button 
                onClick={() => handleDelete(val.id)}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Homepage