/* eslint-disable react/prop-types */
// import React from "react";
import { Box, Image, Text, Stack, useColorMode, Heading, Tag } from "@chakra-ui/react";
import { Link } from "react-router-dom";


function TripComponent({ trip }) {
	const { colorMode } = useColorMode();
	console.log(trip._id)
	return (
		<div>
			<Link to={`/viewtrip/${trip._id}`}>
			<Box w="350px" rounded="20px"
				overflow="hidden" bg={
					colorMode ===
						"dark" ?
						"gray.700" :
						"gray.100"}
						_hover={{background: "gray.200", color: "gray.700"}}
				mt={10} mb={5}>
				<Image src={trip.imageUrl} alt="Card Image" boxSize="350px">
				</Image>
				<Box p={5}>
					<Stack align="center">
						<Heading as='h3' fontSize={'20'}
							fontWeight="semibold"
							my={2} >
							{trip.city}, {trip.country}
						</Heading>
						<Text fontWeight="light" noOfLines={3}>
							{trip.description}
						</Text>
					</Stack>
				</Box>
				<Stack align="center" direction="row" ml={5} mb={3}>
					{trip.categories.map((category, index) => (
						<Tag key={index} variant="solid" colorScheme="teal" rounded="full" px={2}>
						{category}
						</Tag>
					))}
				</Stack>
			</Box>
			</Link>
		</div>
	);
}

export default TripComponent;
