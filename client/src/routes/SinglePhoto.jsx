import React, { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"

function SinglePhoto () {

    // Sets the intiial state
    const initialState = {
        id: Number, 
        title: "",
        description: "",
        s3Key: "",
        createdAt: "",
        s3Url: ""
    }

    const { id } = useParams()

    const [singlePhoto, setPhoto] = useState(initialState)

    const fetchImage = async (id) => {
        try {
            const res = await axios.get(`/api/${id}`)
            setPhoto(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchImage(id)
    }, [id])


    return (
        <div>
            <img src={singlePhoto.s3Url} alt={singlePhoto.title} />
            <h3>{singlePhoto.title}</h3>
            <p>{singlePhoto.description}</p>
        </div>
    )
}

export default SinglePhoto