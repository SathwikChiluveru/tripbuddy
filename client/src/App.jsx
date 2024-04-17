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
import ProfilePage from './pages/ProfilePage'
import EditProfile from './pages/EditProfile';
import CreateTrip from './pages/CreateTrip';
import { PlayGround } from './pages/PlayGround';
import MyTrip from './pages/MyTrip';
import { ViewTrip } from './pages/ViewTrip';

const App = () => {
  return (
    <Flex minH={'100vh'} direction={"column"}>
      <Box flex="1">
        <Routes>
          <Route index path="/" element={<Landing />} />
          <Route path="/main" element={<MainPage/>}/>
          <Route path="/login" element={<SignInPage/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/profile" element={<ProfilePage/>}/>
          <Route path="/editprofile" element={<EditProfile/>}/>
          <Route path="/createtrip" element={<CreateTrip/>}/>
          <Route path="/playground" element={<PlayGround/>}/>
          <Route path="/mytrips" element={<MyTrip/>}/>
          <Route path="/viewtrip/:tripId" element={<ViewTrip/>}/>

        </Routes>
      </Box>
      <Footer/>
    </Flex>
  )
}

export default App;