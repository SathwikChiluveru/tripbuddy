const destinations = require('./destinations.json');

function matchName(names, input) {
  if (typeof input !== 'string') return undefined;
  const normalized = input.trim().toLocaleLowerCase();
  return names.find(name => name.toLocaleLowerCase() === normalized);
}

function resolveDestination(country, city) {
  const matchedCountry = matchName(Object.keys(destinations), country);
  if (!matchedCountry) return { error: 'Choose a country from the destination suggestions.' };
  const matchedCity = matchName(destinations[matchedCountry], city);
  if (!matchedCity) return { error: `Choose a city listed for ${matchedCountry}.` };
  return { country: matchedCountry, city: matchedCity };
}

module.exports = { destinations, resolveDestination };
