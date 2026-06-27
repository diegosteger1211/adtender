interface PlaceholderPageProps {
  title: string
  description: string
  icon?: React.ReactNode
  badge?: string
}

export default function PlaceholderPage({ title, description, icon, badge }: PlaceholderPageProps) {
  return (
    <div className="p-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {badge && (
            <span className="text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-300">
          {icon || (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          )}
        </div>
        <h3 className="text-base font-semibold text-gray-700 mb-1">Noch keine Inhalte</h3>
        <p className="text-sm text-gray-400 max-w-xs">
          Dieser Bereich wird in einem der nächsten Sprints implementiert.
        </p>
        <div className="mt-4 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
          <span className="text-xs text-amber-600 font-medium">🚧 In Entwicklung</span>
        </div>
      </div>
    </div>
  )
}
