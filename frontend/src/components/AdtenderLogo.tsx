interface AdtenderLogoProps {
  className?: string
}

export default function AdtenderLogo({ className = 'h-10' }: AdtenderLogoProps) {
  return (
    <svg
      viewBox="0 0 560 110"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: 'auto', display: 'block' }}
    >
      <defs>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@700&display=swap');`}</style>
      </defs>
      <text
        x="0"
        y="84"
        fontFamily="'Source Sans 3', 'Source Sans Pro', Arial, sans-serif"
        fontSize="82"
        fontWeight="700"
        fill="#1A6DB5"
        letterSpacing="0"
      >
        adtender
      </text>
      {/* adesso-style bracket: top tick + vertical + diagonal foot */}
      <line x1="492" y1="12" x2="516" y2="12" stroke="#8A8880" strokeWidth="5.5" strokeLinecap="round" />
      <line x1="516" y1="12" x2="516" y2="82" stroke="#8A8880" strokeWidth="5.5" strokeLinecap="round" />
      <line x1="516" y1="82" x2="494" y2="108" stroke="#8A8880" strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  )
}
