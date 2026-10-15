import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <>
            <h1>GamePlay</h1>
            <p>Welcome to GamePlay! Discover games, share reviews, and build your library.</p>
            <p><Link to="/games">Browse games</Link></p>
        </>
    );
}
