import { corsRouter } from "convex-helpers/server/cors"
import { httpRouter } from "convex/server"
import { chatGET } from "./chat_http/get.route"
import { guestSessionPOST } from "./chat_http/guest_session.route"
import { chatPOST } from "./chat_http/post.route"
import { transcribeAudio } from "./speech_to_text"

const http = httpRouter()
const cors = corsRouter(http, {
    allowedOrigins: [
        "http://localhost:3000",
        "https://citadel.sincerelyyyash.com",
        "https://citadel-chat.vercel.app",
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
    allowCredentials: true
})

cors.route({
    path: "/guest-session",
    method: "POST",
    handler: guestSessionPOST
})

cors.route({
    path: "/chat",
    method: "POST",
    handler: chatPOST
})

cors.route({
    path: "/chat",
    method: "GET",
    handler: chatGET
})

// Speech-to-text route
cors.route({
    path: "/transcribe",
    method: "POST",
    handler: transcribeAudio
})

export default http
