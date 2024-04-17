/* eslint-disable no-unused-vars */
import { Box, useColorMode, useColorModeValue, Card, Image, Flex, Text, Heading, Tag, Button, Stat, StatNumber, StatLabel, StatGroup } from '@chakra-ui/react';
import { CardBody } from '@chakra-ui/react';
import { CardFooter } from '@chakra-ui/react';
import { CiHashtag } from "react-icons/ci";
import { TripParticipants } from '../components/TripParticipants';
import Navbar from './../components/Navbar';
import Cookies from 'js-cookie'
import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react';

export const ViewTrip = () => {
    const sessionId = Cookies.get('sessionId')
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
                        {tripData.categories.map((tags, index) => (
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
                    <Button variant='solid' colorScheme='blue'>
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

            <Box marginLeft={'20'} height={'100%'} width={'84%'} maxW="m" bg={useColorModeValue('white', 'gray.900')}>
                <Heading mb={5}>Trip Participants</Heading>
                <TripParticipants/>
                <TripParticipants/>
            </Box>
        </Box>
        </>
    )
}
