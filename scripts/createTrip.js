const axios = require('axios');
const { faker } = require('@faker-js/faker');

const endpoint = 'http://localhost:3000/api/trip/createTrip';

// Function to generate random trip data
function generateRandomTripData() {
    return {
        hostId: '661581a19491c849c680c0ec',
        host: 'test1',
        title: faker.lorem.words(3),
        startDate: faker.date.future(),
        endDate: faker.date.future(),
        duration: faker.datatype.number({ min: 1, max: 30 }),
        totalSlots: faker.datatype.number({ min: 5, max: 20 }),
        country: faker.address.country(),
        city: faker.address.city(),
        categories: [faker.random.word(), faker.random.word()],
        tags: [faker.random.word(), faker.random.word()],
        description: faker.lorem.paragraph(),
        imageUrl: faker.image.imageUrl()
    };
}

// Function to make POST request to create a trip
async function createTrip(tripData) {
    try {
        const response = await axios.post(endpoint, tripData);
        console.log('Trip created:', response.data);
    } catch (error) {
        console.error('Error creating trip:', error.response.data);
    }
}

// Create 100 trips
async function createMultipleTrips() {
    for (let i = 0; i < 10; i++) {
        const tripData = generateRandomTripData();
        await createTrip(tripData);
    }
}

// Call the function to start creating trips
createMultipleTrips();
