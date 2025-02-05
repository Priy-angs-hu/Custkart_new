import React, { useContext, useEffect } from 'react'
import Header from '../components/Header'
import { useNavigate } from 'react-router'
import { AuthStore } from '../store/AuthStore'
import PreviousOrders from '../components/PreviousOrders'
import Footer from '../components/Footer'
import { Bounce, ToastContainer } from 'react-toastify'

const Orders = () => {
    const {getUser}=useContext(AuthStore)
    const navigate=useNavigate();
    useEffect(()=>{
        const checkUser=async()=>{
        const response =await getUser();
        if(!response){
            navigate("/login")
        }
        }
        checkUser();
     },[])
  return (
    <div>
      <Header/>
      <PreviousOrders/>
      <Footer/>
    </div>
  )
}

export default Orders
