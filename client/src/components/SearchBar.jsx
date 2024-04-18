/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Box, Input, InputGroup, Button, InputRightElement } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

function SearchBar({ setSearchTerm }) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value);
  };

  return (
    <Box maxWidth="400px" width='80%'>
      <InputGroup size='md'>
        <Input
          pr='4.5rem'
          placeholder='Search trips...'
          borderRadius={20}
          focusBorderColor='black'
          value={inputValue}
          onChange={handleInputChange}
        />
        <InputRightElement width='3rem' bg='inherit'>
          <Button h='1.75rem' size='sm' borderRadius={30}>
            <SearchIcon />
          </Button>
        </InputRightElement>
      </InputGroup>
    </Box>
  );
}

export default SearchBar;
