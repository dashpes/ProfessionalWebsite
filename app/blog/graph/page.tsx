import { redirect } from 'next/navigation'

// Redirect to main blog page since graph is now the default view
export default function BlogGraphPage() {
  redirect('/blog')
}
