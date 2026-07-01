interface AdtenderLogoProps {
  className?: string
}

export default function AdtenderLogo({ className = 'h-10' }: AdtenderLogoProps) {
  return (
    <svg
      viewBox="0 0 720 130"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: 'auto', display: 'block' }}
    >
      <defs>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@700&display=swap');`}</style>
      </defs>
      <text
        x="10"
        y="95"
        fontFamily="'Source Sans 3', 'Source Sans Pro', Arial, sans-serif"
        fontSize="90"
        fontWeight="700"
        fill="#1E7DC4"
        letterSpacing="-1"
      >
        adtender
      </text>
      {/* adesso-style bracket: vertical line + diagonal foot (no top tick) */}
      <line x1="660" y1="18" x2="660" y2="90" stroke="#8B7F72" strokeWidth="5" strokeLinecap="round" />
      <line x1="660" y1="90" x2="630" y2="122" stroke="#8B7F72" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}
