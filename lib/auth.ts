import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

export function verifyAdminToken(request: NextRequest): boolean {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return false
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { admin?: boolean }
    return decoded.admin === true
  } catch {
    return false
  }
}