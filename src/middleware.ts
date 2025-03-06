import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    '/',
    '/cases/:path*',
    '/api/cases/:path*',
    '/api/notes/:path*',
    '/api/generate-summary/:path*',
  ],
} 