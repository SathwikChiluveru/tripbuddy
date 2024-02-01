import React from 'react'
import Hero from '../components/Hero'
import { Box } from '@chakra-ui/react'
import Testimonials from '../components/Testimonials'
import Navbar from './../components/Navbar';

const Landing = () => {
  return (
    <Box>
        <Navbar/>
        <Hero/>
        <Testimonials/>
    </Box>
  )
}

export default Landing
