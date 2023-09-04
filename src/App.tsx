import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { create } from 'zustand';

const word = 'apple';
const maxLetters = 5;
const maxRows = 6;

type Letter = {
  value: string;
  state: 'not_checked' | 'match' | 'exist' | 'miss';
};

interface Game {
  board: Letter[][];
  gstate: 'win' | 'lose' | 'ongoing';
  letterIdx: number;
  rowIdx: number;

  typeChar: (char: string) => void;
  backspace: () => void;
  enter: () => void;
}

function nl(): Letter {
  return { value: '', state: 'not_checked' };
}

const useGameStore = create<Game>((set) => ({
  board: [
    [nl(), nl(), nl(), nl(), nl()],
    [nl(), nl(), nl(), nl(), nl()],
    [nl(), nl(), nl(), nl(), nl()],
    [nl(), nl(), nl(), nl(), nl()],
    [nl(), nl(), nl(), nl(), nl()],
    [nl(), nl(), nl(), nl(), nl()],
  ] as unknown as Letter[][],
  letterIdx: 0,
  rowIdx: 0,
  gstate: 'ongoing',

  typeChar: (c: string) => {
    set((state) => {
      const { board, letterIdx, rowIdx, gstate } = state;
      if (gstate !== 'ongoing' || letterIdx >= maxLetters) {
        return state;
      }

      board[rowIdx][letterIdx].value = c;
      const newLetterIdx = Math.min(letterIdx + 1, maxRows);
      return { board, letterIdx: newLetterIdx, rowIdx, gstate };
    });
  },

  backspace: () => {
    set((state) => {
      const { board, letterIdx, rowIdx, gstate } = state;
      if (gstate !== 'ongoing' || letterIdx === 0) {
        return state;
      }
      board[rowIdx][letterIdx - 1].value = '';
      return { board, letterIdx: letterIdx - 1, rowIdx, gstate };
    });
  },

  enter: () => {
    set((state) => {
      const { board, letterIdx, rowIdx, gstate } = state;
      if (gstate !== 'ongoing' || letterIdx < maxLetters) {
        return state;
      }

      let won = true;
      for (let i = 0; i < maxLetters; i++) {
        const c = board[rowIdx][i].value;
        const state = c === word.charAt(i) ? 'match' : word.includes(c) ? 'exist' : 'miss';
        board[rowIdx][i].state = state;
        if (state != 'match') {
          won = false;
        }
      }

      const gameState = won ? 'win' : rowIdx + 1 === maxRows ? 'lose' : 'ongoing';

      return { board, letterIdx: 0, rowIdx: rowIdx + 1, gstate: gameState };
    });
  },
}));

export default function App() {
  const game = useGameStore();

  useEffect(() => {
    document.addEventListener('keydown', (e) => {
      if (game.gstate !== 'ongoing') {
        return;
      }
      if (e.key === 'Backspace') {
        game.backspace();
      } else if (e.key === 'Enter') {
        game.enter();
      } else if (e.key.length === 1) {
        game.typeChar(e.key);
      }
    });
  }, []);

  return (
    <>
      <div className='flex w-screen justify-center text-4xl border-b border-b-gray-500 py-4 text-white'>Wordle</div>

      {game.gstate === 'win' && <Popup> Congrats </Popup>}
      {game.gstate === 'lose' && <Popup> Try again </Popup>}

      <div className='mt-10'>
        {game.board.map((row, rowIdx) => (
          <div key={rowIdx} className='flex justify-center'>
            {row.map((letter, letterIdx) => (
              <Tail key={letterIdx} letter={letter} />
            ))}
          </div>
        ))}
      </div>

      <div className='flex w-screen justify-center mt-2'>
        <Keyboard game={game} />
      </div>
    </>
  );
}

function Tail({ letter }: { letter: Letter }) {
  return (
    <div
      className={clsx(
        'flex justify-center items-center w-16 h-16 border-2 border-[#3a3a3a] text-3xl m-0.5 uppercase',

        letter.value !== '' && 'border-[#565758]',
        letter.state === 'match' && 'bg-green-500',
        letter.state === 'miss' && 'bg-gray-500',
        letter.state === 'exist' && 'bg-yellow-500'
      )}
    >
      {letter.value}
    </div>
  );
}

function Keyboard({ game }: { game: Game }) {
  // create keyboard like in the game wordle
  const { typeChar, backspace, enter } = game;
  return (
    <div className='flex flex-col justify-center'>
      <div className='flex gap-1.5 mb-1.5 justify-center'>
        <Key char={'q'} onClick={() => typeChar('q')} />
        <Key char={'w'} onClick={() => typeChar('w')} />
        <Key char={'e'} onClick={() => typeChar('e')} />
        <Key char={'r'} onClick={() => typeChar('r')} />
        <Key char={'t'} onClick={() => typeChar('t')} />
        <Key char={'y'} onClick={() => typeChar('y')} />
        <Key char={'u'} onClick={() => typeChar('u')} />
        <Key char={'i'} onClick={() => typeChar('i')} />
        <Key char={'o'} onClick={() => typeChar('o')} />
        <Key char={'p'} onClick={() => typeChar('p')} />
      </div>

      <div className='flex gap-1.5 mb-1.5 justify-center'>
        <Key char={'a'} onClick={() => typeChar('a')} />
        <Key char={'s'} onClick={() => typeChar('s')} />
        <Key char={'d'} onClick={() => typeChar('d')} />
        <Key char={'f'} onClick={() => typeChar('f')} />
        <Key char={'g'} onClick={() => typeChar('g')} />
        <Key char={'h'} onClick={() => typeChar('h')} />
        <Key char={'j'} onClick={() => typeChar('j')} />
        <Key char={'k'} onClick={() => typeChar('k')} />
        <Key char={'l'} onClick={() => typeChar('i')} />
      </div>

      <div className='flex gap-1.5 justify-center'>
        <button onClick={() => enter()} className='bg-[#818384] h-[58px] w-[65px] rounded-md uppercase'>
          enter
        </button>
        <Key char={'z'} onClick={() => typeChar('z')} />
        <Key char={'x'} onClick={() => typeChar('x')} />
        <Key char={'c'} onClick={() => typeChar('c')} />
        <Key char={'v'} onClick={() => typeChar('v')} />
        <Key char={'b'} onClick={() => typeChar('b')} />
        <Key char={'n'} onClick={() => typeChar('n')} />
        <Key char={'m'} onClick={() => typeChar('m')} />
        <button
          onClick={() => backspace()}
          className='bg-[#818384] h-[58px] w-[65px] rounded-md uppercase flex justify-center items-center'
        >
          <svg aria-hidden='true' xmlns='http://www.w3.org/2000/svg' height='20' viewBox='0 0 24 24' width='20'>
            <path
              fill='white'
              d='M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z'
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
}

function Key({ char, onClick }: { char: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className='bg-[#818384] h-[58px] w-[43px] font-bold text-xl rounded-md uppercase'>
      {char}
    </button>
  );
}

function Popup({ children }: { children: React.ReactNode }) {
  const [hide, setHide] = React.useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setHide(true);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  if (hide) {
    return null;
  }

  return createPortal(
    <div className='absolute top-20 left-0 right-0'>
      <div className='flex justify-center text-gray-900 text-2xl bg-white p-4 rounded-md ml-auto mr-auto w-32'>{children}</div>
    </div>,
    document.body
  );
}
