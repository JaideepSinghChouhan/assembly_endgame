import {languages} from '../languages';
import { useState , useEffect } from 'react';
import clsx from 'clsx';
import { getFarewellText } from '../util';
import { words } from '../words';
import confetti from 'canvas-confetti';
export default function AssemblyEndgame() {

    const getRandomWord = () => {
        const randomIndex = Math.floor(Math.random() * words.length);
        return words[randomIndex];
    };

    const [currentWord, setCurrentWord] = useState(getRandomWord());
    const [guessLetters, setGuessLetters] = useState([]);

    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const WrongGuessesCount =  guessLetters.filter((letter) => !currentWord.includes(letter)).length;
    console.log(WrongGuessesCount);

    const isGameWon = currentWord.split('').every((letter) => guessLetters.includes(letter));
    const isGameLost = WrongGuessesCount >= languages.length-1;
    const isGameOver = isGameLost || isGameWon;
    const lastGuessLetter = guessLetters[guessLetters.length - 1];
    const lastGuessIsWrong = lastGuessLetter && !currentWord.includes(lastGuessLetter);

    function addGuessLetter(letter) {
        setGuessLetters((prevGuessLetters) => 
            prevGuessLetters.includes(letter) ? prevGuessLetters : [...prevGuessLetters, letter]
        );
    }

    const languagesElements = languages.map((language,index) => {
        const isLanguageLost = index < WrongGuessesCount;
        const className = clsx( 'chip' , isLanguageLost && 'lost' );
        return (
            <span className={className} key={language.name} style={{ backgroundColor: language.backgroundColor, color: language.color }}>
                {language.name}
            </span>
        );
    });

    const letters = currentWord.split('');
    const displayLetters = letters.map((letter, index) => (
        isGameLost && !guessLetters.includes(letter) ?
            <span key={index} className="letter letter-lost">{letter.toUpperCase()}</span> : (
            <span key={index} className="letter">
                {guessLetters.includes(letter) ? letter.toUpperCase() : '' }
            </span>
        )
    ));

    
    console.log(guessLetters);
    useEffect(() => {
    const handleKeyDown = (event) => {
        if (isGameOver) return; // Ignore key presses if the game is over
        const letter = event.key.toLowerCase();
        if (alphabet.includes(letter)) {
            addGuessLetter(letter);
        }
    };
        window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    }
    
    }, [alphabet,isGameOver]);


    const newGame = () => {
        setGuessLetters([]);
        setCurrentWord(()=>getRandomWord()); // Reset the current word
    };

    const alphabetElements = alphabet.split('').map((letter, index) => {

    const isGuessed = guessLetters.includes(letter);
    const isCorrect = isGuessed && letters.includes(letter);
    const isWrong = isGuessed && !letters.includes(letter); 
    const className = clsx({
        'correct': isCorrect,
        'wrong': isWrong,
        'farewell': !isGameOver && lastGuessIsWrong,
    });
    return(
        <button 
            key={letter} 
            className={className} 
            onClick={() => {
                addGuessLetter(letter); 
            }}
            disabled={isGameOver}
            aria-disabled={guessLetters.includes(letter)}
            aria-label={`Letter ${letter}`}
        >
            {letter.toUpperCase()}
        </button>
    );
});

    const gameStatusClass = clsx('game-status', {
        'won': isGameWon,
        'lost': isGameLost,
        'farewell': !isGameOver && lastGuessIsWrong,
    });

    function renderGameStatus() {
        if (!isGameOver && lastGuessIsWrong) {
            return (
                <p 
                    className={gameStatusClass}
                >
                    {getFarewellText(languages[WrongGuessesCount - 1].name)}
                </p>
            )
        }

        if (isGameWon) {
            return (
                <>
                    <h2>You win!</h2>
                    <p>Well done! 🎉</p>
                </>
            )
        } if (isGameLost) {
            return (
                <>
                    <h2>Game over!</h2>
                    <p>You lose! Better start learning Assembly 😭</p>
                </>
            )
        }
    }
    
    useEffect(() => {
    if (isGameWon) {
        confetti({
            particleCount: 200,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
    }, [isGameWon]);


    return (
        
        <main>
           
            <header>
                <h1>Assembly: Endgame</h1>
                <p>Guess the word within 8 attempts to keep the 
                programming world safe from Assembly!</p>
            </header>
            <section aria-live="polite" role="status" className={gameStatusClass}>
                {renderGameStatus()}
            </section>
            <section className="language-chips">
                {languagesElements}
            </section>
            <section className="word-display">
                {displayLetters}
            </section>
            <section className='alphabet-buttons'>
                {alphabetElements}
            </section>
            {isGameOver && <button className="new-game" onClick={newGame}>New Game</button>}
        </main>
    )
}