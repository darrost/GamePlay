import { useParams } from 'react-router-dom';

export default function GameDetails() {
    const { gameId } = useParams();

    return (
        <>
            <h1>Game Details</h1>
            <p>Details for game: {gameId}</p>
        </>
    );
}
