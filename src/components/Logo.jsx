function Logo({ size = 200 }) {
  const id = 'logo-anim'
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>{`
          @keyframes ${id}-tailLeft {
            0%   { d: path("M-9 -36 Q-13 -28 -16 -18 Q-14 -17 -11 -18 Q-8  -26 -6 -34 Z"); }
            25%  { d: path("M-9 -36 Q-16 -27 -20 -16 Q-18 -15 -14 -17 Q-9  -25 -6 -34 Z"); }
            50%  { d: path("M-9 -36 Q-14 -26 -18 -15 Q-16 -14 -12 -16 Q-8  -26 -6 -34 Z"); }
            75%  { d: path("M-9 -36 Q-11 -28 -14 -18 Q-12 -17 -9  -18 Q-7  -26 -6 -34 Z"); }
            100% { d: path("M-9 -36 Q-13 -28 -16 -18 Q-14 -17 -11 -18 Q-8  -26 -6 -34 Z"); }
          }
          @keyframes ${id}-tailRight {
            0%   { d: path("M9 -36 Q13 -28 16 -18 Q14 -17 11 -18 Q8  -26 6 -34 Z"); }
            25%  { d: path("M9 -36 Q16 -27 20 -16 Q18 -15 14 -17 Q9  -25 6 -34 Z"); }
            50%  { d: path("M9 -36 Q14 -26 18 -15 Q16 -14 12 -16 Q8  -26 6 -34 Z"); }
            75%  { d: path("M9 -36 Q11 -28 14 -18 Q12 -17  9 -18 Q7  -26 6 -34 Z"); }
            100% { d: path("M9 -36 Q13 -28 16 -18 Q14 -17 11 -18 Q8  -26 6 -34 Z"); }
          }
          @keyframes ${id}-blink {
            0%, 88%, 100% { transform: scaleY(1);    }
            92%           { transform: scaleY(0.08); }
          }
          .${id}-tailL { animation: ${id}-tailLeft  1.8s ease-in-out infinite; }
          .${id}-tailR { animation: ${id}-tailRight 1.8s ease-in-out infinite; animation-delay: 0.35s; }
          .${id}-eyeL  { animation: ${id}-blink 3.4s ease-in-out infinite; transform-origin: -11px -38px; }
          .${id}-eyeR  { animation: ${id}-blink 3.4s ease-in-out infinite; transform-origin:  11px -38px; }
        `}</style>
      </defs>

      <g transform="translate(100, 100)">

        {/* ── 3 TINES ── */}
        <rect x="-16" y="-90" width="10" height="34" rx="5" fill="#C0C7CC" stroke="#8E9AA0" strokeWidth="2.5" strokeLinejoin="round"/>
        <rect x="-5"  y="-90" width="10" height="34" rx="5" fill="#C0C7CC" stroke="#8E9AA0" strokeWidth="2.5" strokeLinejoin="round"/>
        <rect x="6"   y="-90" width="10" height="34" rx="5" fill="#C0C7CC" stroke="#8E9AA0" strokeWidth="2.5" strokeLinejoin="round"/>

        {/* Connector bar */}
        <rect x="-19" y="-58" width="38" height="13" rx="6.5" fill="#C0C7CC" stroke="#8E9AA0" strokeWidth="2.5"/>

        {/* ── RED HEADBAND (forehead) ── */}
        <rect x="-22" y="-60" width="44" height="10" rx="5" fill="#E74C3C" stroke="#C0392B" strokeWidth="1.8"/>
        {/* Headband knot */}
        <circle cx="0" cy="-55" r="6" fill="#C0392B" stroke="#A93226" strokeWidth="1.3"/>

        {/* Headband tail LEFT — waving */}
        <path className={`${id}-tailL`}
              d="M-9 -36 Q-13 -28 -16 -18 Q-14 -17 -11 -18 Q-8 -26 -6 -34 Z"
              fill="#E74C3C" stroke="#C0392B" strokeWidth="1"/>
        {/* Headband tail RIGHT — waving */}
        <path className={`${id}-tailR`}
              d="M9 -36 Q13 -28 16 -18 Q14 -17 11 -18 Q8 -26 6 -34 Z"
              fill="#E74C3C" stroke="#C0392B" strokeWidth="1"/>

        {/* ── FORK NECK ── */}
        <path d="M-13 -46 Q-14 -20 -14 10 L14 10 Q14 -20 13 -46 Z"
              fill="#C0C7CC" stroke="#8E9AA0" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>

        {/* ── EYES — just below the headband (~y -38) ── */}
        {/* Left eye */}
        <ellipse cx="-11" cy="-38" rx="5" ry="5" fill="white" stroke="#636E72" strokeWidth="1.2"
                 className={`${id}-eyeL`}/>
        <circle  cx="-10" cy="-37" r="2.6" fill="#2D3436" className={`${id}-eyeL`}/>
        <circle  cx="-9"  cy="-39" r="1"   fill="white"   className={`${id}-eyeL`}/>

        {/* Right eye */}
        <ellipse cx="11"  cy="-38" rx="5" ry="5" fill="white" stroke="#636E72" strokeWidth="1.2"
                 className={`${id}-eyeR`}/>
        <circle  cx="12"  cy="-37" r="2.6" fill="#2D3436" className={`${id}-eyeR`}/>
        <circle  cx="13"  cy="-39" r="1"   fill="white"   className={`${id}-eyeR`}/>

        {/* ── DOJO UNIFORM (gi) ── */}
        <path d="M-34 8 Q-36 6 -34 4 L34 4 Q36 6 34 8 L36 52 Q36 54 34 54 L-34 54 Q-36 54 -36 52 Z"
              fill="white" stroke="#2D3436" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round"/>

        {/* V-neck lapels */}
        <path d="M-34 6 Q-20 22 0 38 Q20 22 34 6"
              fill="none" stroke="#2D3436" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round"/>
        <path d="M-34 6 Q-28 14 -20 22 Q-10 32 0 38 L-34 32 Z" fill="#F5F5F5"/>
        <path d="M34 6 Q28 14 20 22 Q10 32 0 38 L34 32 Z"  fill="#F5F5F5"/>

        {/* ── RED BELT at the waist ── */}
        <rect x="-38" y="50" width="76" height="11" rx="5.5" fill="#E74C3C" stroke="#C0392B" strokeWidth="1.5"/>
        <circle cx="0" cy="55.5" r="6.5" fill="#C0392B" stroke="#A93226" strokeWidth="1.2"/>
        {/* Waist belt tails (static — not animated) */}
        <path d="M-2 62 Q-5 70 -8 80 Q-6 81 -4 80 Q-2 72 0 65 Q2 72 4 80 Q6 81 8 80 Q5 70 2 62 Z"
              fill="#E74C3C" stroke="#C0392B" strokeWidth="1"/>

        {/* Lower uniform — flared at hips */}
        <path d="M-35 58 Q-38 72 -42 94 Q-42 98 -38 98 L38 98 Q42 98 42 94 Q38 72 35 58 Z"
              fill="white" stroke="#2D3436" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round"/>

        {/* ── FORK HANDLE (bottom) ── */}
        <path d="M-9 98 Q-10 110 -8 122 Q-6 134 0 138 Q6 134 8 122 Q10 110 9 98"
              fill="#C0C7CC" stroke="#8E9AA0" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>

      </g>
    </svg>
  )
}

export default Logo
