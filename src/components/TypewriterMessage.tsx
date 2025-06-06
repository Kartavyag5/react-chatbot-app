import React, { useEffect, useState } from 'react';

interface Props {
  text: string;
  onDone?: () => void;
  onStart?:()=> void;
}

const TypewriterMessage: React.FC<Props> = ({ text, onDone, onStart }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (index < text.length) {
        onStart && onStart()
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text.charAt(index));
        setIndex(prev => prev + 1);
      }, 20);
      return () => clearTimeout(timeout);
    } else {
      setDone(true);
      onDone && onDone();
    }
  }, [index, text, onDone]);

  return (
    <div className="bubble">
      {displayedText}
      {!done && <span className="blinking-cursor">|</span>}
    </div>
  );
};

export default TypewriterMessage;
