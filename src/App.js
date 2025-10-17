import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [pokemons, setPokemons] = useState([])

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=20')
      .then(response => response.json())
      .then(data => setPokemons(data.results))
      .catch(error => console.error('Error fetching Pokémon data:', error))
  }, [])

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
