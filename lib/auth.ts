import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone) return null;

        let user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phone: credentials.phone,
              name: credentials.name || "Broker",
              role: "BROKER",
            },
          });
        } else if (credentials.name && credentials.name !== "Broker") {
          // Update name if provided and different
          user = await prisma.user.update({
            where: { id: user.id },
            data: { name: credentials.name },
          });
        }

        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as any).phone;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).phone = token.phone;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
