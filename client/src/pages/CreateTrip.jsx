/* eslint-disable no-unused-vars */
import {
    FormControl,
    FormLabel,
    Button,
    Heading, 
    IconButton, 
    Input, 
    Stack, 
    Textarea, 
    Box, 
    Text, 
    Tag, 
    TagLabel, 
    TagCloseButton,
    Image,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useToast
} from '@chakra-ui/react'
import { ChevronLeftIcon } from "@chakra-ui/icons"
import { useState } from 'react';
import axios from 'axios';
export default function CreateTrip() {

    const [newCategory, setNewCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [tags, setTags] = useState([]);
    const toast = useToast();

    const hostId = '6613ac4dc6160cf638d224d4';

    const [formData, setFormData] = useState({
        hostId: hostId,
        host: "sathwikch",
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        availableSlots: 0,
        categories: [],
        tags: []
    });

    // const handleChange = (e) => {
    //     if (e.target.id === 'Tags' ) {
    //       // For countries visited input field
    //       setNewTag(e.target.value);
    //     } else if (e.target.id === 'Category') {
    //       // For bio textarea
    //       setNewCategory(e.target.value)
    //     } else if (e.target.id === 'description') {
    //         // For bio textarea
    //         setFormData({ ...formData, description: e.target.value }); 
    //     } else {
    //       // For other input fields
    //       setFormData({ ...formData, [e.target.id]: e.target.value });
    //     }
    // };

    const handleSubmit = async () => {
        try {

            // Calculate the duration
            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);
            const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

            const tripData = {
                hostId: hostId,
                host: "sathwikch",
                title: formData.title,
                description: formData.description,
                categories,
                tags,
                startDate: formData.startDate,
                endDate: formData.endDate,
                duration,
                totalSlots: formData.availableSlots,
                city: formData.city,
                country: formData.country,
            };

            const response = await axios.post('http://localhost:3000/api/trip/createTrip', tripData);
            
            toast({
                title: 'Trip Created Successfully.',
                status: 'success',
                position: 'top-right',
                duration: 5000,
                isClosable: true,
            })

            // Optionally, redirect to another page or display a success message
        } catch (error) {
            console.error('Error creating trip:', error);
            toast({
                title: 'Trip Creation Failed.',
                status: 'error',
                position: 'top-right',
                duration: 5000,
                isClosable: true,
              })
            // Handle error, show error message, etc.
        }
    };

    

    const handleCategoryInputKeyDown = (e) => {
        if (e.key === 'Enter' && newCategory.trim() !== '') {
          setCategories((prevCategories) => [...prevCategories, newCategory.trim()]);
          setNewCategory('');
        }
      };
    
    const handleRemoveCategory = (categoryToRemove) => {
        setCategories((prevCategories) => prevCategories.filter((category) => category !== categoryToRemove));
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' && newTag.trim() !== '') {
          setTags((prevTags) => [...prevTags, newTag.trim()]);
          setNewTag('');
        }
      };
    
    const handleRemoveTag = (tagToRemove) => {
        setTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
    };

    return (
        <Stack direction='column' m={'30px 50px'} minH={'75.8vh'}>
            <Stack direction='row' align={'center'}>
                <IconButton
                    isRound={true}
                    variant='solid'
                    colorScheme='teal'
                    aria-label='Done'
                    fontSize='36px'
                    icon={<ChevronLeftIcon />}
                />
                <Heading ml={'30px'}>Create Trip</Heading>
            </Stack>

            <Stack direction={'row'} width={'100%'} p={'30px 90px'} gap={'10%'}>
                <Stack width={'50%'}>
                    <FormControl width={'100%'} justifyContent={'flex-start'} isRequired>
                        <FormLabel fontSize={'24px'}>Trip Name</FormLabel>
                        <Input type='text' placeholder="Type a cool name..." mb={'20px'} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                    </FormControl>

                    <FormControl width={'100%'} justifyContent={'flex-start'} isRequired>
                        <FormLabel fontSize={'24px'}>Destination</FormLabel>
                        <Input type='text' placeholder="Type a cool name..." mb={'20px'} value={formData.destination} onChange={(e) => {
                        const [city, country] = e.target.value.split(',').map(item => item.trim());
                        setFormData({ ...formData, city, country });
                        }} 
                        required 
                        />                    
                    </FormControl>

                    <FormControl id='description' isRequired>
                        <FormLabel fontSize={'24px'}>Description</FormLabel>
                        <Textarea type='text' placeholder="Type the description..." mb={'20px'} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                    </FormControl>
                    
                    <FormControl id="Category" isRequired>
                    <FormLabel fontSize={'24px'}>Category</FormLabel>
                        <Input
                        type='text'
                        placeholder="Type a category and press Enter"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={handleCategoryInputKeyDown}
                        mb={'20px'}
                        name='category'
                        required
                        />
                    </FormControl>
                    <Stack direction="row" flexWrap="wrap">
                        {categories.map((category) => (
                        <Tag key={category} size="md" variant="solid" colorScheme="teal" m={1}>
                            <TagLabel>{category}</TagLabel>
                            <TagCloseButton onClick={() => handleRemoveCategory(category)} />
                        </Tag>
                        ))}
                    </Stack>

                    <FormControl id="Tags" isRequired>
                    <FormLabel fontSize={'24px'}>Tags</FormLabel>
                        <Input
                        type='text'
                        placeholder="Type a tag and press Enter"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        mb={'20px'}
                        name='tag'
                        required
                        />
                    </FormControl>
                    <Stack direction="row" flexWrap="wrap">
                        {tags.map((tag) => (
                        <Tag key={tag} size="md" variant="solid" colorScheme="teal" m={1}>
                            <TagLabel>{tag}</TagLabel>
                            <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                        </Tag>
                        ))}
                    </Stack>


                    <Stack direction="row" spacing={4}>
                        <Button
                            onClick={handleSubmit}
                            colorScheme="blue" 
                            variant="solid"
                            width="fit-content"
                        >
                            Submit
                        </Button>
                        <Button
                            colorScheme="gray"
                            variant="solid"
                            width="fit-content"
                        >
                            Reset
                        </Button>
                    </Stack>
                </Stack>

                <Stack width={'50%'} flexDirection={'column'} justifyContent={'space-between'} >
                    <Box h={'1%'}>
                        <FormLabel fontSize={'24px'}>Start Date</FormLabel>
                        <Input mb={5} placeholder="Select Date and Time" size="md" type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                        <FormLabel fontSize={'24px'}>End Date</FormLabel>
                        <Input placeholder="Select Date and Time" size="md" mb={'20px'} type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />

                        <FormControl id="slots" isRequired>
                            <FormLabel fontSize={'24px'}>Available Slots</FormLabel>
                            <NumberInput value={formData.availableSlots} onChange={(value) => setFormData({ ...formData, availableSlots: value })}>
                            <NumberInputField/>
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                            </NumberInput>
                        </FormControl>
                    </Box>
                    <Box marginBottom="20">
                        <FormLabel fontSize={'24px'}>Image <Text as='sup' color={'red'}>*</Text> </FormLabel>
                        <Box>
                                <Image
                                    objectFit='cover'
                                    maxW={{ base: '100%', sm: '200px' }}
                                    src={'https://placehold.co/200x200'}
                                    alt='Test Picture'
                                />
                            </Box>
                    </Box>
                </Stack>
            </Stack>
        </Stack>
    )
}