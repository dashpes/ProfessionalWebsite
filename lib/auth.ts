import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export function verifyAdminToken(request: NextRequest): { valid: boolean; admin?: boolean } {
  try {
    // Fail securely if JWT_SECRET not configured
    if (!JWT_SECRET) {
      console.error('JWT_SECRET not configured')
      return { valid: false }
    }

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return { valid: false }
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { admin?: boolean }
    return { valid: decoded.admin === true, admin: decoded.admin }
  } catch {
    return { valid: false }
  }
}