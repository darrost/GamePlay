import { useState } from 'react';
import './GameCover.css';

export default function GameCover({ src, title, eager = false }) {
    const [failedSource, setFailedSource] = useState(null);
    const hasImage = typeof src === 'string' && /^https?:\/\//.test(src) && failedSource !== src;

    if (!hasImage) {
        return (
            <div className="game-cover game-cover-fallback" role="img" aria-label={`Cover unavailable for ${title}`}>
                <span>Cover unavailable</span>
            </div>
        );
    }

    return (
        <img className="game-cover" src={src} alt={`Cover for ${title}`}
            loading={eager ? 'eager' : 'lazy'} decoding="async" referrerPolicy="no-referrer"
            onError={() => setFailedSource(src)} />
    );
}
