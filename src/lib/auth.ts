// src/lib/auth.ts
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: "prooftimeline",
  }),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: "/signin",
    verifyRequest: "/signin?checkEmail=1",
    error: "/signin?error=1",
  },
  session: {
    // with a DB adapter, this is fine as "database" sessions
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      // make userId available everywhere
      if (session.user) {
        // @ts-expect-error - add id to session user
        session.user.id = user.id;
      }
      return session;
    },
  },
});

