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
    Image
} from '@chakra-ui/react'
import { ChevronLeftIcon } from "@chakra-ui/icons"
import { useState } from 'react';
export default function CreateTrip() {

    const [newCategory, setNewCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [newTag, setnewTag] = useState('');
    const [tags, setTags] = useState([]);

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
          setnewTag('');
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
                        <Input type='text' placeholder="Type a cool name..." mb={'20px'} name='title' required />
                        <FormLabel fontSize={'24px'}>Description</FormLabel>
                        <Textarea type='text' placeholder="Type the description..." mb={'20px'} name='description' required />
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
                        onChange={(e) => setnewTag(e.target.value)}
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
                        <Input placeholder="Select Date and Time" size="md" type="datetime-local"/>
                        <FormLabel fontSize={'24px'}>End Date</FormLabel>
                        <Input placeholder="Select Date and Time" size="md" mb={'20px'} type="datetime-local"/>
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