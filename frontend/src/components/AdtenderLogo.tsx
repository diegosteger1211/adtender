interface AdtenderLogoProps {
  className?: string
}

export default function AdtenderLogo({ className = 'h-10' }: AdtenderLogoProps) {
  return (
    <svg
      viewBox="0 0 480 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: 'auto', display: 'block' }}
    >
      <text
        x="0"
        y="78"
        fontFamily="'Nunito', 'Arial Rounded MT Bold', Arial, sans-serif"
        fontSize="82"
        fontWeight="900"
        fill="#2563EB"
        letterSpacing="-1"
      >
        adtender
      </text>
      {/* Bracket — top horizontal, vertical, bottom horizontal */}
      <polyline
        points="442,8 460,8 460,92 442,92"
        stroke="#9CA3AF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
