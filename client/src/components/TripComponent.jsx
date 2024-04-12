/* eslint-disable react/prop-types */
// import React from "react";
import { Box, Image, Badge, Text, Stack, useColorMode } from "@chakra-ui/react";

function TripComponent({ trip }) {
	const { colorMode } = useColorMode();

	return (
		<div>
			<Box w="350px" rounded="20px"
				overflow="hidden" bg={
					colorMode ===
						"dark" ?
						"gray.100" :
						"gray.100"}

						_hover={{background: "gray.200", color: "gray.700"}}
				mt={10}>
				<Image src={trip.imageUrl} alt="Card Image" boxSize="350px">
				</Image>
				<Box p={5}>
				<Stack align="center">
					{trip.categories.map((category, index) => (
						<Badge key={index} variant="solid" colorScheme="teal" rounded="full" px={2} mr={2}>
						{category}
						</Badge>
					))}
				</Stack>
					<Stack align="center">
						<Text as="h2"
							fontWeight="normal"
							my={2} >
							{trip.city}, {trip.country}
						</Text>
						<Text fontWeight="light">
							{trip.description}
						</Text>
					</Stack>
				</Box>
			</Box>
		</div>
	);
}

export default TripComponent;
