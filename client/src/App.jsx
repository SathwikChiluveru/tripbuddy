import React from 'react'
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Routes, Route } from "react-router-dom";
import {
  Flex,
  Box,
} from "@chakra-ui/react";
import Landing from './pages/Landing';
import MainPage from './pages/MainPage';
import SignInPage from './pages/Login';
import Register from './pages/Register'

const App = () => {
  return (
    <Flex minH={'100vh'} direction={"column"}>
      <Box flex="1">
        <Routes>
          <Route index path="/" element={<Landing />} />
          <Route path="/main" element={<MainPage/>}/>
          <Route path="/login" element={<SignInPage/>} />
          <Route path="/register" element={<Register/>} />

        </Routes>
      </Box>
      <Footer/>
    </Flex>
  )
}

export default App;