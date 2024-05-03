import { Flex, IconButton } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom'

const Header = () => {
    const navigate = useNavigate();
    const handleBack = () => {
        navigate(-1);
    };
  return (
    <Flex
      bg="gray.100"
      justify="space-between"
      align="center"
      height={'7%'}
      px=""
    >
      <Flex>
          <IconButton
            variant="ghost"
            icon={<ArrowBackIcon />}
            aria-label="Notifications"
            ml="3"
            onClick={handleBack}
          />
      </Flex>
    </Flex>
  );
};

export default Header;