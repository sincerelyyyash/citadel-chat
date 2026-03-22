const base =
    process.env.VITE_BETTER_AUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3000"

export default {
    providers: [
        {
            type: "customJwt",
            applicationID: "citadel",
            issuer: base,
            jwks: `${base}/api/auth/jwks`,
            algorithm: "RS256"
        }
    ]
}
