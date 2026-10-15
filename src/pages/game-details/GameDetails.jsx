import { useParams } from 'react-router-dom';

export default function GameDetails() {
    // useParams reads the ":gameId" segment from the URL, e.g. /games/42 -> "42"
    const { gameId } = useParams();

    return (
        <>
            <h1>Game Details</h1>
            <p>Details for game: {gameId}</p>
        </>
    );
}
