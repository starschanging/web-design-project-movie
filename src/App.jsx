import { useState, useEffect, useRef } from "react"
import MovieModal from "./MovieModal.jsx"

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE = "https://api.themoviedb.org/3"
const IMG = "https://image.tmdb.org/t/p/w342"

export default function App() {
    const [input, setInput] = useState("")
    const [query, setQuery] = useState("")
    const [movies, setMovies] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [selected, setSelected] = useState(null)
    const searchId = useRef(0)

    // fetch from tmdb
    async function getMovies(q, p) {
        let url
        if (q) {
            url = BASE + "/search/movie?api_key=" + API_KEY + "&query=" + encodeURIComponent(q) + "&page=" + p
        } else {
            url = BASE + "/movie/popular?api_key=" + API_KEY + "&page=" + p
        }
        const res = await fetch(url)
        if (!res.ok) {
            throw new Error("Request failed (" + res.status + ")")
        }
        const data = await res.json()
        return data
    }

    // new search, back to page 1
    useEffect(() => {
        searchId.current = searchId.current + 1
        const myId = searchId.current
        setLoading(true)
        setError("")

        getMovies(query, 1)
            .then((data) => {
                if (myId !== searchId.current) return
                setMovies(data.results)
                setPage(1)
                setTotalPages(data.total_pages)
            })
            .catch((err) => {
                if (myId === searchId.current) setError(err.message)
            })
            .finally(() => {
                if (myId === searchId.current) setLoading(false)
            })
        // eslint-disable-next-line
    }, [query])

    // get the next page
    async function loadMore() {
        const myId = searchId.current
        setLoading(true)
        setError("")
        try {
            const data = await getMovies(query, page + 1)
            if (myId !== searchId.current) return
            setMovies([...movies, ...data.results])
            setPage(data.page)
            setTotalPages(data.total_pages)
        } catch (err) {
            if (myId === searchId.current) setError(err.message)
        }
        if (myId === searchId.current) setLoading(false)
    }

    function handleSubmit(e) {
        e.preventDefault()
        setQuery(input.trim())
    }

    const noResults = !loading && !error && movies.length === 0
    const canLoadMore = page < totalPages

    return (
        <div className="app">
            <header className="header">
                <h1>Movie Explorer</h1>
                <form className="search" onSubmit={handleSubmit}>
                    <input
                        type="search"
                        placeholder="Search for a movie…"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        aria-label="Search movies"
                    />
                    <button type="submit">Search</button>
                </form>
            </header>

            <main>
                {!API_KEY && (
                    <p className="message error">
                        Missing API key. Copy <code>.env.example</code> to <code>.env</code> and add your TMDB key.
                    </p>
                )}
                {error && <p className="message error">{error}</p>}

                {noResults && <p className="message empty">No results for &lsquo;{query}&rsquo;</p>}

                <ul className="grid">
                    {movies.map((m) => (
                        <li key={m.id}>
                            <button className="card" onClick={() => setSelected(m)}>
                                {m.poster_path ? (
                                    <img src={IMG + m.poster_path} alt={m.title + " poster"} loading="lazy" />
                                ) : (
                                    <div className="no-poster">No image</div>
                                )}
                                <div className="card-info">
                                    <h2>{m.title}</h2>
                                    <p>
                                        {m.release_date ? m.release_date.slice(0, 4) : "—"} · ★{" "}
                                        {m.vote_average ? m.vote_average.toFixed(1) : "N/A"}
                                    </p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>

                {loading && <p className="message">Loading…</p>}

                {!loading && canLoadMore && movies.length > 0 && (
                    <div className="load-more">
                        <button onClick={loadMore}>Load more</button>
                    </div>
                )}
            </main>

            {selected && <MovieModal movie={selected} onClose={() => setSelected(null)} />}
        </div>
    )
}
