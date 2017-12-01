export const fetchRandomJoke = async () => {
  const response = await fetch('http://api.icndb.com/jokes/random');
  const result = await response.json();
  return result.value.joke;
};