import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { getStoredUser } from '../../lib/auth'

export default function AppShell() {
  const user = getStoredUser()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-[#F0F4F8] overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
