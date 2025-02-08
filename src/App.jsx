import React, { useEffect, useState } from "react"
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from "./appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTION = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {

  const [searchTerm, setSearchTerm] = useState('')
  const [movieList, setMovieList] = useState([])
  const [trendingMovies, setTrendingMovies] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [deboucedSearchTerm, setDeboucedSearchTerm] = useState('')

  useDebounce(() => setDeboucedSearchTerm(searchTerm), 500, [searchTerm])


  const fetchMovies = async (query = '') => {
    setIsLoading(true)
    try {
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`

      const response = await fetch(endpoint, API_OPTION)

      const data = await response.json()
      console.log(data)

      setMovieList(data.results || [])

      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0])
      }
    } catch(error) {
      console.log(`Error fetching Movies: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTrendinMovies = async () => {
    try {
      const movies = await getTrendingMovies()

      setTrendingMovies(movies)
    } catch(error) {
      console.log(`Error fetching the trending movies : ${error}`)
    }
  }


  useEffect(() => {
    fetchMovies(deboucedSearchTerm)
  },[deboucedSearchTerm])

  useEffect(() => {
    loadTrendinMovies()
  },[])

  return (
    <main style={{overflow: 'hidden'}}>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner"/>
          <h1>Find <span className="text-gradient">Movies</span> You can Binge Watch Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>

        {trendingMovies.length>0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index+1}</p>
                  <img src={movie.poster_url} alt="" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>
          {isLoading ? (
            <Spinner/>
            ) : (
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie}/>
                ))}
              </ul>
          )}
        </section>

      </div>
    </main>
  )
}

export default App;