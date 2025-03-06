import NextAuth, { AuthOptions, SessionStrategy, Session, JWT } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from '@/lib/mongodb'
import { User } from '@/models/User'

interface CustomSession extends Session {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  }
}

interface CustomJWT extends JWT {
  role?: string;
  provider?: string;
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await connectToDatabase();
        
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error('No user found with this email');
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email before signing in');
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }: { session: CustomSession; token: CustomJWT }) {
      if (session?.user) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    },
    async jwt({ token, user, account }: { token: CustomJWT; user?: any; account?: any }) {
      if (user) {
        token.role = user.role
      }
      if (account) {
        token.provider = account.provider
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt' as SessionStrategy,
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 