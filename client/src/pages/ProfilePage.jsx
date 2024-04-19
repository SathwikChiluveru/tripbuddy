import { useState, useEffect } from 'react';
import { Box, Card, Image, useColorMode, useColorModeValue, Text, Button, Icon } from '@chakra-ui/react';
import { InfoOutlineIcon, StarIcon, Search2Icon } from '@chakra-ui/icons';
import axios from 'axios';
import Cookies from 'js-cookie';
import AboutMe from './../components/Aboutme';
import MyTrips from './../components/MyTrips';
import CountriesComponent from './../components/CountriesComponent';
import Navbar from './../components/Navbar';
import { useParams } from "react-router-dom";

const LinkItem = ({ name, icon, onClick }) => {
    return (
        <Button
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            paddingLeft="16px"
            height="40px"
            width="100%"
            borderRadius="none"
            _hover={{ bgColor: 'gray.300' }}
            leftIcon={icon}
            colorScheme='black'
            variant="ghost"
            onClick={onClick}
        >
            {name}
        </Button>
    );
};

export default function ProfilePage() {
    const { userId } = useParams();
    const [selectedLink, setSelectedLink] = useState('aboutMe');
    const [userData, setUserData] = useState(null);
    const [trips, setTrips] = useState([]);
    const [sessionID, setSessionID] = useState(null);
    const { colorMode, toggleColorMode } = useColorMode();

    const handleLinkClick = (linkName) => {
        setSelectedLink(linkName);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sessionId = Cookies.get('sessionId');
                setSessionID(sessionId);
                const userDataResponse = await axios.get(`http://localhost:3000/api/user/getUserById/${userId}`);
                setUserData(userDataResponse.data);
                const tripsResponse = await axios.get(`http://localhost:3000/api/trip/getTripById/${userId}`);
                setTrips(tripsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [userId]);

    return (
        <>
            <Navbar sessionId={sessionID} />
            <Box bg={useColorModeValue('white', 'gray.900')} alignItems="center" display="flex">
                <Box w={'full'} h={['auto', '100vh']} bg={useColorModeValue('white', 'gray.900')} alignItems="center" display="flex">
                    <Card marginLeft={'20'} marginTop={'0'} height={'90vh'} width={'30vh'} bg={useColorModeValue('gray.200', 'gray.900')} >
                        <Image
                            border={['5px solid white', '5px solid white']}
                            borderRadius="10"
                            boxSize={['120px', '150px']}
                            objectFit='cover'
                            src={userData ? userData.imageUrl : ''}
                            alt='User Profile'
                            marginLeft={['0', '20px']}
                            marginTop={['10px', '50px']}
                            marginBottom={'10'}
                        />
                        <LinkItem name="About Me" icon={<Icon as={InfoOutlineIcon} />} onClick={() => handleLinkClick('aboutMe')} />
                        <LinkItem name="My Trips" icon={<Icon as={StarIcon} />} onClick={() => handleLinkClick('myTrips')} />
                        <LinkItem name="Countries" icon={<Icon as={Search2Icon} />} onClick={() => handleLinkClick('countries')} />
                    </Card>
                    <Card marginLeft={'10'} marginTop={'0'} height={'90vh'} width={'140vh'} bg={useColorModeValue('gray.200', 'gray.900')}>
                        {selectedLink === 'aboutMe' && <AboutMe userData={userData} />}
                        {selectedLink === 'myTrips' && <MyTrips trips={trips} />}
                        {selectedLink === 'countries' && <CountriesComponent userData={userData} />}
                    </Card>
                </Box>
            </Box>
        </>
    );
}
