"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// Mock user type - replace with your actual user type
type User = {
  id: string
  name: string
  email: string
  avatar?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGithub: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthInitializer({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // In a real app, this would verify a token with your backend
      const token = localStorage.getItem('auth_token')
      
      if (token) {
        // Verify token with your API
        // const response = await fetch('/api/auth/verify', { headers: { Authorization: `Bearer ${token}` } })
        // if (response.ok) {
        //   const userData = await response.json()
        //   setUser(userData)
        // }
        
        // For demo - mock user
        setUser({
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'
        })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Replace with actual API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password })
      // })
      
      // Mock successful login
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
      }
      
      setUser(mockUser)
      localStorage.setItem('auth_token', 'mock_jwt_token')
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      // Replace with actual API call
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password, name })
      // })
      
      // Mock successful signup
      const mockUser: User = {
        id: '2',
        name: name,
        email: email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + name
      }
      
      setUser(mockUser)
      localStorage.setItem('auth_token', 'mock_jwt_token')
      router.push('/dashboard')
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // await fetch('/api/auth/logout')
      setUser(null)
      localStorage.removeItem('auth_token')
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      // OAuth flow would go here
      window.location.href = '/api/auth/google' // or your OAuth endpoint
    } catch (error) {
      console.error('Google login failed:', error)
      setIsLoading(false)
    }
  }

  const loginWithGithub = async () => {
    setIsLoading(true)
    try {
      // OAuth flow would go here
      window.location.href = '/api/auth/github' // or your OAuth endpoint
    } catch (error) {
      console.error('GitHub login failed:', error)
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        loginWithGoogle,
        loginWithGithub,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthInitializer')
  }
  return context
}