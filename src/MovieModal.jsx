import { useEffect } from "react"

const IMG = "https://image.tmdb.org/t/p/w500"

export default function MovieModal({ movie, onClose }) {
    // esc closes, no bg scroll
    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", onKey)
        const old = document.body.style.overflow
        document.body.style.overflow = "hidden"

        return () => {
            window.removeEventListener("keydown", onKey)
            document.body.style.overflow = old
        }
    }, [onClose])

    return (
        <div className="backdrop" onClick={onClose}>
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="close" onClick={onClose} aria-label="Close">
                    ×
                </button>
                {movie.poster_path && (
                    <img className="modal-poster" src={IMG + movie.poster_path} alt={movie.title + " poster"} />
                )}
                <div className="modal-body">
                    <h2 id="modal-title">{movie.title}</h2>
                    <p className="meta">
                        {movie.release_date || "Release date unknown"} · ★{" "}
                        {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                    </p>
                    <p>{movie.overview || "No overview available."}</p>
                </div>
            </div>
        </div>
    )
}
