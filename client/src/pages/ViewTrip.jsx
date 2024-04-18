import { useState, useEffect } from 'react';
import { Box, useColorMode, useColorModeValue, Card, Image, SimpleGrid, Text, Heading, Tag, Button, Stat, StatNumber, StatLabel, StatGroup, useToast } from '@chakra-ui/react';
import { CardBody } from '@chakra-ui/react';
import { CardFooter } from '@chakra-ui/react';
import { CiHashtag } from "react-icons/ci";
import { ChatIcon } from '@chakra-ui/icons'
import { TripParticipants } from '../components/TripParticipants';
import Navbar from './../components/Navbar';
import Cookies from 'js-cookie'
import { useParams } from "react-router-dom";
import axios from 'axios'


export const ViewTrip = () => {
    const toast = useToast()
    const sessionId = Cookies.get('sessionId')
    console.log("SessionID:", sessionId)
    const { colorMode, toggleColorMode } = useColorMode()
    const { tripId } = useParams();
    console.log("View Page Trip ID", tripId)

    const [tripData, setTripData] = useState(null);

    useEffect(() => {
        const fetchTripData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/trip/getTripByTripId/${tripId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch trip data');
                }
                const data = await response.json();
                data.startDate = new Date(data.startDate);
                data.endDate = new Date(data.endDate);
                setTripData(data);
            } catch (error) {
                console.error('Error fetching trip data:', error);
            }
        };

        fetchTripData();
    }, [tripId]);

    if (!tripData) {
        return <div>Loading...</div>;
    }

    console.log(tripData)

    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const handleJoinTrip = async () => {
        try {
            await axios.post(`http://localhost:3000/api/trip/jointrip/${tripId}`, { userId: sessionId });
            toast({
                title: "Trip Joined",
                description: "You have successfully joined the trip.",
                status: "success",
                position: 'top-right',
                duration: 5000,
                isClosable: true,
            });

            setTripData(prevTripData => ({
                ...prevTripData,
                tripMates: [...prevTripData.tripMates, sessionId]
            }));

        } catch (error) {
            console.error('Error joining trip:', error);
            console.log('Error response:', error.response);
            if (error.response && error.response.status === 409) {
                toast({
                    title: "Already Joined",
                    description: "You are already part of this trip.",
                    status: "warning",
                    position: 'top-right',
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to join the trip.",
                    status: "error",
                    position: 'top-right',
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const isUserParticipant = tripData.tripMates && tripData.tripMates.includes(sessionId);

    return (
        <>
        <Navbar sessionId={sessionId}/>
        <Box bg={useColorModeValue('white', 'gray.900')} alignItems="center">
            <Box w={'full'} h={['auto', '60vh']} bg={useColorModeValue('white', 'gray.900')} alignItems="center" display="flex">
                <Card marginLeft={'20'} height={'80%'} maxW="sm" minW="sm" bg={useColorModeValue('gray.200', 'gray.900')} >
                    <Image
                        src={tripData.imageUrl}
                        alt="Green double couch with wooden legs"
                        borderRadius="lg"
                        height={'100%'}
                    />
                </Card>
                <Card marginLeft={'10'} height={'80%'} width={'50%'} maxW="m" bg={useColorModeValue('gray.100', 'gray.900')} >
                <CardBody>
                    <Heading mb={3}>{tripData.title}</Heading>
                    <Heading size='md' marginBottom={'2%'}>{tripData.city}, {tripData.country}</Heading>
                    <Box mb={3}>
                        {tripData.categories.map((category, index) => (
                            <Tag key={index} variant="solid" colorScheme="teal" rounded="full" mr={2}>
                            {category}
                            </Tag>
                        ))}
                    </Box>
                    <Box mb={3}>
                        {tripData.tags.map((tags, index) => (
                            <Tag key={index} variant="solid" colorScheme='green' size={'md'} rounded="full" mr={2}>
                            <CiHashtag/> {tags}
                            </Tag>
                        ))}
                    </Box>
                    <Box>
                    <StatGroup>
                        <Stat>
                            <StatLabel>Start Date</StatLabel>
                            <StatNumber fontSize={'18'}>{formatDate(tripData.startDate)}</StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel>End Date</StatLabel>
                            <StatNumber fontSize={'18'}>{formatDate(tripData.endDate)}</StatNumber>
                        </Stat>
                    </StatGroup>
                    </Box>
                </CardBody>
                    <CardFooter mt={-5}>
                    {isUserParticipant && (
                        <Button variant='solid' leftIcon={<ChatIcon />}  colorScheme='green' mr={2}>
                            Chat
                        </Button>
                    )}
                    <Button variant='solid' colorScheme='blue' onClick={handleJoinTrip}>
                        Join Trip
                    </Button>
                    </CardFooter>
                </Card>
            </Box>
            <Box marginBottom={'2%'}>
                <Card marginLeft={'20'} height={'100%'} width={'84%'} maxW="m" bg={useColorModeValue('gray.100', 'gray.900')} >
                        <CardBody>
                            <Text>{tripData.description}</Text>
                        </CardBody>
                </Card>
            </Box>

            {tripData && tripData.tripMates && tripData.tripMates.length > 0 && (
            <Box marginLeft={'20'} height={'100%'} width={'84%'} maxW="m" bg={useColorModeValue('white', 'gray.900')}>
                <Heading mb={5}>Trip Participants</Heading>
                <SimpleGrid columns={2} spacing={4}>
                    {tripData.tripMates.map((participantId) => (
                    <TripParticipants key={participantId} userId={participantId} />
                    ))}
                </SimpleGrid>
            </Box>
            )}
        </Box>
        </>
    )
}
