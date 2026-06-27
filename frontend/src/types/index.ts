export type Role = 'admin' | 'berater' | 'kunde' | 'anbieter'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  tenantId: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}
