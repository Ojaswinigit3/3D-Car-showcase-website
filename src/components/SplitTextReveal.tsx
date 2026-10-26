import React from 'react';

interface SplitHeadlineProps {
  text: string;
  active: boolean;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
  delayMs?: number;
}

/**
 * Splits display headings into words and characters with mask-reveal,
 * translateY, and blur-to-sharp transitions driven by active chapter state.
 */
export const SplitHeadline: React.FC<SplitHeadlineProps> = ({
  text,
  active,
  className = '',
  as: Tag = 'h2',
  delayMs = 0,
}) => {
  const words = text.split(' ');

  return (
    <Tag
      className={`overflow-hidden leading-[1.02] tracking-tight ${className}`}
      style={{ textWrap: 'balance' }}
      aria-label={text}
    >
      {words.map((word, wIdx) => (
        <span
          key={`${word}-${wIdx}`}
          className="inline-block overflow-hidden mr-[0.26em] pb-1 align-bottom"
        >
          {word.split('').map((char, cIdx) => {
            const totalIndex = wIdx * 5 + cIdx;
            const charDelay = delayMs + totalIndex * 18;
            return (
              <span
                key={`${char}-${cIdx}`}
                aria-hidden="true"
                className="inline-block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
                style={{
                  transitionDelay: `${charDelay}ms`,
                  transform: active ? 'translate3d(0, 0%, 0)' : 'translate3d(0, 105%, 0)',
                  opacity: active ? 1 : 0,
                  filter: active ? 'blur(0px)' : 'blur(6px)',
                }}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
};

interface SplitParagraphProps {
  text: string;
  active: boolean;
  className?: string;
  delayMs?: number;
}

/**
 * Splits body paragraphs into phrase lines that slide up and sharpen in sequence.
 */
export const SplitParagraph: React.FC<SplitParagraphProps> = ({
  text,
  active,
  className = '',
  delayMs = 120,
}) => {
  // Split into readable clauses/phrases
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  words.forEach((w) => {
    if ((current + ' ' + w).trim().length > 52) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  });
  if (current.trim()) lines.push(current.trim());

  return (
    <p className={`leading-relaxed ${className}`} aria-label={text}>
      {lines.map((line, idx) => (
        <span key={idx} className="block overflow-hidden">
          <span
            className="block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
            style={{
              transitionDelay: `${delayMs + idx * 75}ms`,
              transform: active ? 'translate3d(0, 0%, 0)' : 'translate3d(0, 90%, 0)',
              opacity: active ? 1 : 0,
              filter: active ? 'blur(0px)' : 'blur(4px)',
            }}
          >
            {line}{' '}
          </span>
        </span>
      ))}
    </p>
  );
};
