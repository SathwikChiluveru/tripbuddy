const axios = require('axios');
const { faker } = require('@faker-js/faker');

const endpoint = 'http://localhost:3000/api/user/register';

// Function to generate random user data
function generateRandomUserData() {
    return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: 'password123'
    };
}

// Function to make POST request to create a user
async function createUser(userData) {
    try {
        const response = await axios.post(endpoint, userData);
        console.log('User created:', response.data);
    } catch (error) {
        console.error('Error creating user:', error.response.data);
    }
}

// Create 100 users
async function createMultipleUsers() {
    for (let i = 0; i < 100; i++) {
        const userData = generateRandomUserData();
        await createUser(userData);
    }
}

// Call the function to start creating users
createMultipleUsers();
