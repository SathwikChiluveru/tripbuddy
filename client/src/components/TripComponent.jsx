/* eslint-disable react/prop-types */
import React from "react";
import {
	Box, Image, Badge, Text, Stack,
	useColorMode, Button, Flex, Spacer
}
	from "@chakra-ui/react";

function TripComponent() {
	const { colorMode } = useColorMode();

	return (
		<div>
			<Box w="300px" rounded="20px"
				overflow="hidden" bg={
					colorMode ===
						"dark" ?
						"gray.700" :
						"gray.200"}
				mt={10}>
				<Image src=
"https://media.geeksforgeeks.org/wp-content/uploads/20210727094649/img1.jpg"
					alt="Card Image" boxSize="300px">
				</Image>
				<Box p={5}>
					<Stack align="center">
						<Badge variant="solid"
							colorScheme="green"
							rounded="full" px={2}>
							Skiing
						</Badge>
					</Stack>
					<Stack align="center">
						<Text as="h2"
							fontWeight="normal"
							my={2} >
							Japan Trip, Tokyo
						</Text>
						<Text fontWeight="light">
							First trip this year
						</Text>
					</Stack>
				</Box>
			</Box>
		</div>
	);
}

export default TripComponent;
