import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import worldMapData from '../assets/features.json';
import { Box } from '@chakra-ui/react';

// const countriesVisited = ["Colombia", "Russia", "Malaysia", "Thailand", "Indonesia", "China"];

export default function ProfileMap( {countriesVisited }) {
  return (
    <Box w="90%" mx="auto" mt={4}>
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 150 }}
        width={800}
        height={400}
      >
        <Geographies geography={worldMapData}>
          {({ geographies }) =>
            geographies.map(geo => {
              const countryName = geo.properties.name;
              const isVisited = countriesVisited.includes(countryName);
              return (
                <Geography
                  key={geo.id}
                  geography={geo}
                  fill={isVisited ? '#0f6ae5' : '#D6D6DA'}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </Box>
  );
}
