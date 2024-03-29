import React, { useState } from "react"
import axios from "axios"

function Homepage() {
  const [file, setFile] = useState()

  const submit = async event => {
    event.preventDefault()

    const formData = new FormData();
    formData.append("image", file)
    await axios.post("/api", formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  }

  return (
    <form onSubmit={submit}>
      <input onChange={e => setFile(e.target.files[0])} type="file" accept="image/*"></input>
      <button type="submit">Submit</button>
    </form>
  )
}

export default Homepage
