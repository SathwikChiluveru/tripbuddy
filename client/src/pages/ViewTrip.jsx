/* eslint-disable no-unused-vars */
import { Box, useColorMode, useColorModeValue, Card, Image, Flex, Text, Heading } from '@chakra-ui/react';

export const ViewTrip = () => {
    const { colorMode, toggleColorMode } = useColorMode()

    return (
        <Box w={'full'} h={['auto', '60vh']} bg={useColorModeValue('white', 'gray.900')} alignItems="center" display="flex">
            <Card marginLeft={'20'} maxW="sm" bg={useColorModeValue('gray.200', 'gray.900')} >
                <Image
                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                    alt="Green double couch with wooden legs"
                    borderRadius="lg"
                />
            </Card>
            <Card marginLeft={'10'} height={'80%'} width={'50%'} maxW="m" bg={useColorModeValue('gray.200', 'gray.900')} >
                <Heading size='md'>The perfect latte</Heading>
                <Text py='2'>
                Caffè latte is a coffee beverage of Italian origin made with espresso
                and steamed milk.
                </Text>
            </Card>
        </Box>
    )
}
