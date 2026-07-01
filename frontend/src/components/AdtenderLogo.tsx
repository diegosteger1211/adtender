interface AdtenderLogoProps {
  className?: string
}

export default function AdtenderLogo({ className = 'h-10' }: AdtenderLogoProps) {
  return (
    <svg
      viewBox="0 0 820 130"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: 'auto', display: 'block' }}
    >
      <defs>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cabin:wght@700&display=swap');`}</style>
      </defs>
      <text
        x="10"
        y="98"
        fontFamily="'Cabin', 'Source Sans 3', Arial, sans-serif"
        fontSize="96"
        fontWeight="700"
        fill="#1B75BB"
        letterSpacing="0"
      >
        adtender
      </text>
      {/* adesso 1:1: vertical + diagonal foot, right of text, no top tick */}
      <line x1="770" y1="20" x2="770" y2="92" stroke="#9E9286" strokeWidth="7" strokeLinecap="round" />
      <line x1="770" y1="92" x2="732" y2="130" stroke="#9E9286" strokeWidth="7" strokeLinecap="round" />
    </svg>
  )
}
