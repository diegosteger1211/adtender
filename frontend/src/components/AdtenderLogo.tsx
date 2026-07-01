interface AdtenderLogoProps {
  className?: string
}

export default function AdtenderLogo({ className = 'h-10' }: AdtenderLogoProps) {
  return (
    <svg
      viewBox="0 0 780 130"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: 'auto', display: 'block' }}
    >
      <defs>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@800&display=swap');`}</style>
      </defs>
      <text
        x="10"
        y="98"
        fontFamily="'Nunito', 'Source Sans 3', Arial, sans-serif"
        fontSize="92"
        fontWeight="800"
        fill="#1B75BB"
        letterSpacing="-1"
      >
        adtender
      </text>
      {/* adesso 1:1: vertical line + diagonal foot, right of text */}
      <line x1="720" y1="22" x2="720" y2="92" stroke="#9E9286" strokeWidth="6" strokeLinecap="round" />
      <line x1="720" y1="92" x2="686" y2="128" stroke="#9E9286" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}
