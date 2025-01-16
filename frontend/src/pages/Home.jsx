import React, { useContext, useEffect } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'
import { AuthStore } from '../store/AuthStore'

const Home = () => {
      const {getUser}=useContext(AuthStore)
   useEffect(()=>{
         getUser();
      },[])
  return (
    <div >
      <Header></Header>
      <Hero/>
      <Testimonials/>
      <Footer/>
    </div>
  )
}

export default Home
