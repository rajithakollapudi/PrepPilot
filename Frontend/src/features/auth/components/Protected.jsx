import React from 'react'
import { useNavigate } from 'react-router'
import  {useAuth} from "../hooks/useAuth"
import {Navigate} from "react-router"
const Protected = ({children}) => {

    const {loading , user} = useAuth()
    const navigate = useNavigate()

    if(loading)
    {
        return(<main>Loading.....</main>)
    }

    if(!user)
    {
    return <Navigate to="/login" />

    }


  return (
    <div>
      {children}
    </div>
  )
}

export default Protected
