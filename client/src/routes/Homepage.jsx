import React, { useEffect, useState } from "react"
import axios from "axios"

function Homepage() {
  const [file, setFile] = useState()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

    try {
      const formData = new FormData();
      formData.append("image", file)
      formData.append("title", title)
      formData.append("description", description)
      
      await axios.post("/api/", formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      
      // Reset form
      setFile(null)
      setTitle("")
      setDescription("")
      
      // Refresh images list
      const res = await axios.get("/api/")
      setImages(res.data)

      // Reset the file input by clearing its value
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ""
      
    } catch (error) {
      console.error(error)
    }
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

  const handleEdit = async (id) => {
    try {
      await axios.put(`/api/${id}`, {
        title: editTitle,
        description: editDescription
      })
      // Refresh the images list after edit
      const res = await axios.get("/api/")
      setImages(res.data)
      setEditingId(null) // Close edit mode
    } catch (error) {
      console.error(error)
    }
  }

  const startEditing = (image) => {
    setEditingId(image.id)
    setEditTitle(image.title)
    setEditDescription(image.description)
  }

  const handleImageClick = async (id) => {
    try {
      const res = await axios.get(`/api/${id}`)
      setSelectedImage(res.data)
      setIsModalOpen(true)
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
            <div 
              className="relative aspect-[4/5] overflow-hidden cursor-pointer"
              onClick={() => handleImageClick(val.id)}
            >
              <img 
                src={val.s3Url} 
                alt={val.title} 
                className="w-full h-full object-cover transition duration-300 ease-out group-hover:scale-105 group-hover:rotate-1"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4">
              {editingId === val.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Edit title"
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Edit description"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(val.id)}
                      className="flex-1 bg-violet-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-neutral-200 text-neutral-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-neutral-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-1">{val.title}</h3>
                  <p className="text-sm text-neutral-600 mb-4">{val.description}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEditing(val)}
                      className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
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
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative max-w-7xl w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex flex-col lg:flex-row">
              <div className="lg:flex-1">
                <img 
                  src={selectedImage.s3Url} 
                  alt={selectedImage.title}
                  className="w-full h-full object-contain max-h-[80vh]"
                />
              </div>
              
              <div className="p-6 lg:w-96 bg-white/90">
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                  {selectedImage.title}
                </h2>
                <p className="text-neutral-600 mb-4">
                  {selectedImage.description}
                </p>
                <div className="text-sm text-neutral-500">
                  Added {new Date(selectedImage.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Homepage