import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

import { prisma } from "@/database/db"
import { jwt } from "better-auth/plugins/jwt"

export const auth = betterAuth({
    trustedOrigins: [
        process.env.VERCEL_URL!,
        "https://citadel.chat",
        "http://localhost:3000",
        "https://localhost:3000"
    ].filter(Boolean),
    baseURL: process.env.VITE_BETTER_AUTH_URL || "http://localhost:3000",

    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || ""
        }
    },
    plugins: [
        jwt({
            jwt: {
                audience: "citadel",
                expirationTime: "6h"
            },
            jwks: {
                keyPairConfig: {
                    alg: "RS256",
                    modulusLength: 2048,
                    extractable: true
                }
            }
        })
    ]
})
