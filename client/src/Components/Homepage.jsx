import React, { useState } from "react"
import axios from "axios"

function Homepage() {
  const [file, setFile] = useState()
  const [title, setTitle] = useState()
  const [description, setDescription] = useState()

  const submit = async event => {
    event.preventDefault()

    const formData = new FormData();
    formData.append("image", file)
    formData.append("title", title)
    formData.append("description", description)
    await axios.post("/api", formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  }

  return (
    <form onSubmit={submit}>
      <input onChange={e => setFile(e.target.files[0])} type="file" accept="image/*"></input>
      <input value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder='Title'></input>
      <input value={description} onChange={e => setDescription(e.target.value)} type="text" placeholder='Description'></input>
      <button type="submit">Submit</button>
    </form>
  )
}

export default Homepage
