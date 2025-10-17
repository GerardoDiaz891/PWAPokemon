import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [pokemons, setPokemons] = useState([])

  useEffect(() => {
    const url = 'https://pokeapi.co/api/v2/pokemon?limit=20';
    fetch(url)
      .then(response => response.json())
      .then(data => setPokemons(data.results))
      .catch(async error => {
        // Si falla fetch, intentar leer del cache (modo offline)
        if ('caches' in window) {
          try {
            const cache = await window.caches.open('poke-pwa-cache-v2');
            const cachedResponse = await cache.match(url);
            if (cachedResponse) {
              const data = await cachedResponse.json();
              setPokemons(data.results);
              return;
            }
          } catch (e) {
            // Ignorar errores de cache
          }
        }
        console.error('Error fetching Pokémon data:', error);
      });
  }, []);

  return (
    <>
      <h1>Pokémon List</h1>
      {pokemons.length === 0 ? (
        <p style={{ color: '#e3350d', fontWeight: 'bold', marginTop: '2rem' }}>
          No hay Pokémon para mostrar.<br />
          (¿Sin conexión o sin datos guardados?)
        </p>
      ) : (
        <ul>
          {pokemons.map((pokemon, index) => (
            <li key={pokemon.name}>
              <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`} alt={`${pokemon.name} sprite`} />
              <span>{pokemon.name}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default App
