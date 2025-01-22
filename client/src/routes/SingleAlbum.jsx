import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

function SingleAlbum() {
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const [allPhotos, setAllPhotos] = useState([])
  const [isAddingPhotos, setIsAddingPhotos] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState([])

  useEffect(() => {
    fetchAlbum()
    fetchAllPhotos()
  }, [id])

  const fetchAlbum = async () => {
    try {
      const res = await axios.get(`/api/albums/${id}`)
      setAlbum(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchAllPhotos = async () => {
    try {
      const res = await axios.get('/api')
      setAllPhotos(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddPhotos = async () => {
    try {
      await axios.post(`/api/albums/${id}/photos`, {
        photoIds: selectedPhotos
      })
      setIsAddingPhotos(false)
      setSelectedPhotos([])
      fetchAlbum()
    } catch (error) {
      console.error(error)
    }
  }

  if (!album) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 px-4 py-8 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-800 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600">
              {album.title}
            </h1>
            <p className="text-neutral-600 mt-2">{album.description}</p>
          </div>
          <button
            onClick={() => setIsAddingPhotos(true)}
            className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Add Photos
          </button>
        </div>

        {isAddingPhotos && (
          <div className="mb-8 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-xl shadow-lg border border-neutral-200/50 p-6">
            <h2 className="text-lg font-semibold mb-4">Select Photos to Add</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allPhotos
                .filter(photo => !album.photos.some(p => p.id === photo.id))
                .map(photo => (
                  <div
                    key={photo.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden ${
                      selectedPhotos.includes(photo.id) ? 'ring-2 ring-violet-500' : ''
                    }`}
                    onClick={() => {
                      setSelectedPhotos(prev =>
                        prev.includes(photo.id)
                          ? prev.filter(id => id !== photo.id)
                          : [...prev, photo.id]
                      )
                    }}
                  >
                    <img
                      src={photo.s3Url}
                      alt={photo.title}
                      className="w-full h-32 object-cover"
                    />
                    {selectedPhotos.includes(photo.id) && (
                      <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddPhotos}
                disabled={selectedPhotos.length === 0}
                className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Selected Photos
              </button>
              <button
                onClick={() => {
                  setIsAddingPhotos(false)
                  setSelectedPhotos([])
                }}
                className="bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {album.photos.map((photo) => (
            <div
              key={photo.id}
              className="group bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-xl shadow-sm border border-neutral-200/50 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={photo.s3Url}
                  alt={photo.title}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-neutral-800">{photo.title}</h3>
                <p className="text-sm text-neutral-600">{photo.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SingleAlbum 