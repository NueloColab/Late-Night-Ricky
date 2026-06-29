'use client';

export default function Loader() {
  return (
    <div className="lnr-loader" id="lnr-loader">
      <div className="lnr-loader-inner">
        {['LATE', 'NIGHT', 'RICKY'].map((word, wi) => (
          <div key={wi} className="lnr-loader-line" style={{ animationDelay: `${wi * 0.35 + 0.2}s` }}>
            {word.split('').map((char, ci) => (
              <span
                key={ci}
                className="lnr-loader-char"
                style={{ animationDelay: `${(wi * 4 + ci) * 0.06 + 0.4}s` }}
              >
                {char}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}