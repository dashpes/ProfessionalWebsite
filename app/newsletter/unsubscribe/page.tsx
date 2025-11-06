'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'already' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid unsubscribe link. No token provided.')
      return
    }

    const unsubscribe = async () => {
      try {
        const response = await fetch(`/api/newsletter/unsubscribe?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          if (data.alreadyUnsubscribed) {
            setStatus('already')
            setMessage('You have already unsubscribed from this newsletter.')
          } else {
            setStatus('success')
            setMessage('You have been successfully unsubscribed from the newsletter.')
          }
        } else {
          setStatus('error')
          setMessage(data.error || 'Failed to unsubscribe. Please try again.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred. Please try again later.')
      }
    }

    unsubscribe()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Newsletter Unsubscribe
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {status === 'loading' && (
            <div className="py-8">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-600" />
              <p className="mt-4 text-gray-600">Processing your request...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
              <p className="mt-4 text-lg text-gray-800 font-medium">{message}</p>
              <p className="mt-2 text-sm text-gray-600">
                We're sorry to see you go. You will no longer receive emails from us.
              </p>
            </div>
          )}

          {status === 'already' && (
            <div className="py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-blue-600" />
              <p className="mt-4 text-lg text-gray-800 font-medium">{message}</p>
              <p className="mt-2 text-sm text-gray-600">
                You are not receiving any emails from our newsletter.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="py-8">
              <XCircle className="w-16 h-16 mx-auto text-red-600" />
              <p className="mt-4 text-lg text-gray-800 font-medium">Unsubscribe Failed</p>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <Link href="/blog">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Back to Blog
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
