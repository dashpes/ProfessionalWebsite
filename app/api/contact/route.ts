import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import nodemailer from 'nodemailer'

// HTML escape function to prevent injection attacks
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Gmail SMTP configuration
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // This is an App Password, not your regular password
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()
    
    // Validate the data
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const contactEmail = process.env.CONTACT_EMAIL
    if (!contactEmail) {
      console.error('CONTACT_EMAIL environment variable not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    let emailSent = false

    // Try Gmail first (if configured)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        const transporter = createGmailTransporter()
        
        await transporter.sendMail({
          from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
          to: contactEmail,
          replyTo: body.email,
          subject: `Portfolio Contact: ${body.subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
                New Contact Form Submission
              </h2>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${escapeHtml(body.name)}</p>
                <p><strong>Email:</strong> <a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a></p>
                <p><strong>Subject:</strong> ${escapeHtml(body.subject)}</p>
              </div>
              <div style="background-color: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
                <p><strong>Message:</strong></p>
                <p style="line-height: 1.6;">${escapeHtml(body.message).replace(/\n/g, '<br>')}</p>
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                Sent from your portfolio website contact form
              </p>
            </div>
          `,
          text: `
New Contact Form Submission

Name: ${body.name}
Email: ${body.email}
Subject: ${body.subject}

Message:
${body.message}

---
Sent from your portfolio website contact form
          `
        })
        
        emailSent = true
        console.log('Email sent successfully via Gmail')
      } catch (emailError) {
        console.error('Gmail sending failed:', emailError)
      }
    }

    // Fallback to Resend if Gmail failed and Resend is configured
    if (!emailSent && resend) {
      try {
        await resend.emails.send({
          from: 'noreply@yourdomain.com', // Replace with your verified domain
          to: contactEmail,
          replyTo: body.email,
          subject: `Portfolio Contact: ${body.subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${escapeHtml(body.name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(body.email)}</p>
            <p><strong>Subject:</strong> ${escapeHtml(body.subject)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(body.message).replace(/\n/g, '<br>')}</p>
          `,
        })
        emailSent = true
        console.log('Email sent successfully via Resend')
      } catch (emailError) {
        console.error('Resend sending failed:', emailError)
      }
    }

    // Log submission metadata only (no PII)
    console.log('Contact form submission:', {
      timestamp: new Date().toISOString(),
      emailSent: emailSent ? 'Yes' : 'No (check email configuration)'
    })

    return NextResponse.json(
      { 
        message: emailSent 
          ? 'Message sent successfully!' 
          : 'Message received! (Email delivery pending - check server logs)' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
