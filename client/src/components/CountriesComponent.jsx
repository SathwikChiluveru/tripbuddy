import { Box, Text, useColorMode, Flex } from '@chakra-ui/react';
import ProfileMap from './ProfileMap';

const CountriesComponent = ({ userData }) => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Flex direction="column" alignItems="center" justifyContent="center" mt={'10'}>
      <Text as='b' fontSize={['xl', '4xl']}>Places Visited</Text>
      {userData && <ProfileMap countriesVisited={userData.countriesVisited} />}
    </Flex>
  );
};

export default CountriesComponent;
