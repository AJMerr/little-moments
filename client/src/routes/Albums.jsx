import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

function Albums() {
  const [albums, setAlbums] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchAlbums()
  }, [])

  const fetchAlbums = async () => {
    try {
      const res = await axios.get('/api/albums')
      setAlbums(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleCreateAlbum = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/albums', { title, description })
      setTitle('')
      setDescription('')
      setIsCreating(false)
      fetchAlbums()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 px-4 py-8 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-800 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600">
            Albums
          </h1>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Create Album
          </button>
        </div>

        {isCreating && (
          <div className="mb-8 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-xl shadow-lg border border-neutral-200/50 p-6">
            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">Album Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <Link
              key={album.id}
              to={`/albums/${album.id}`}
              className="group bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-xl shadow-sm border border-neutral-200/50 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-video relative overflow-hidden">
                {album.photos[0] && (
                  <img
                    src={album.photos[0].s3Url}
                    alt={album.title}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="text-xl font-bold text-white">{album.title}</h2>
                  <p className="text-sm text-white/80">{album.photos.length} photos</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Albums
