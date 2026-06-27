import type { User, Role } from '../types'

const STORAGE_KEY = 'adtender_user'

export function getStoredUser(): User | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function storeUser(user: User): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function clearUser(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    admin: 'Administrator',
    berater: 'Berater',
    kunde: 'Kunde',
    anbieter: 'Anbieter',
  }
  return labels[role]
}

export function getRoleColor(role: Role): string {
  const colors: Record<Role, string> = {
    admin: 'bg-purple-100 text-purple-700',
    berater: 'bg-blue-100 text-blue-700',
    kunde: 'bg-emerald-100 text-emerald-700',
    anbieter: 'bg-orange-100 text-orange-700',
  }
  return colors[role]
}
