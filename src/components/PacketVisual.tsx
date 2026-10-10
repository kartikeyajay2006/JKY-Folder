/** Original decorative packet illustration. No customer data or review claims. */
export function PacketVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`packet-visual ${compact ? 'packet-visual-compact' : ''}`} aria-hidden="true">
      <div className="packet-glow" />
      <svg viewBox="0 0 520 440" fill="none" className="packet-blueprint">
        <defs>
          <linearGradient
            id={compact ? 'packet-edge-compact' : 'packet-edge'}
            x1="120"
            y1="100"
            x2="400"
            y2="370"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#f1e7ff" />
            <stop offset=".55" stopColor="#b99be8" />
            <stop offset="1" stopColor="#806393" />
          </linearGradient>
          <radialGradient
            id={compact ? 'packet-surface-compact' : 'packet-surface'}
            cx="0"
            cy="0"
            r="1"
            gradientTransform="translate(205 210) rotate(60) scale(220 260)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#282033" />
            <stop offset="1" stopColor="#101013" />
          </radialGradient>
        </defs>
        <g className="blueprint-grid" stroke="#827392" strokeOpacity=".14">
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d={`M${60 + i * 45} 50v340M40 ${40 + i * 40}h440`} />
          ))}
        </g>
        <circle
          cx="260"
          cy="220"
          r="171"
          stroke="#9f8cb6"
          strokeOpacity=".16"
          strokeDasharray="3 7"
        />
        <circle cx="260" cy="220" r="206" stroke="#9f8cb6" strokeOpacity=".08" />
        <g className="blueprint-particles">
          {Array.from({ length: 66 }, (_, i) => (
            <circle
              key={i}
              cx={30 + ((i * 73) % 460)}
              cy={30 + ((i * 47) % 380)}
              r={i % 7 === 0 ? 1.8 : 0.8}
              fill={i % 3 ? '#ad99cb' : '#f4edff'}
              opacity={0.14 + (i % 5) * 0.09}
            />
          ))}
        </g>
        <g className="packet-pages">
          <path
            d="m182 83 183 28 4 209-200-22Z"
            fill="#18151f"
            stroke="#6a5a7c"
            strokeOpacity=".65"
          />
          <path
            d="m149 103 201 2 22 213-208 23Z"
            fill="#1d1825"
            stroke="#9f8bae"
            strokeOpacity=".55"
          />
          <path
            d="M190 145h114m-111 19h81m-78 20h105m-103 20h59"
            stroke="#9d8cab"
            strokeOpacity=".5"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path
            d="m131 153 104-12 33 34 126-12c9-1 17 6 17 15l-5 174c0 10-7 18-17 20l-215 35c-11 2-20-5-22-16l-33-216c-2-11 3-20 12-22Z"
            fill={`url(#${compact ? 'packet-surface-compact' : 'packet-surface'})`}
            stroke={`url(#${compact ? 'packet-edge-compact' : 'packet-edge'})`}
            strokeWidth="1.4"
          />
          <path d="m139 211 241-22" stroke="#70637e" strokeOpacity=".6" />
          <path
            d="m209 271 18 15 33-40"
            stroke="#dfd4ef"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m188 325 57-7m-55 18 83-13"
            stroke="#6b6077"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <circle cx="348" cy="332" r="9" stroke="#6c5b85" />
          <path d="m344 332 3 3 5-6" stroke="#b3d8c4" strokeLinecap="round" />
        </g>
        <g stroke="#897398" strokeOpacity=".7" strokeWidth=".8">
          <path d="M104 124H55v-25m348 32h56v37M158 328H58v-28m349 32h45v38" />
          <circle cx="104" cy="124" r="3" fill="#c4a5f2" />
          <circle cx="403" cy="131" r="3" fill="#c4a5f2" />
        </g>
      </svg>
      <span className="visual-label label-instructions">01 / INSTRUCTIONS</span>
      <span className="visual-label label-originals">02 / ORIGINALS</span>
      <span className="visual-label label-evidence">03 / EVIDENCE</span>
      <div className="visual-caption">
        <span />
        ONE APPLICATION. CONNECTED.
      </div>
    </div>
  );
}
