import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { GuestSession } from "./schema/guest_session"
import { Project } from "./schema/folders"
import { Message } from "./schema/message"
import { UserSettings } from "./schema/settings"
import { ResumableStream } from "./schema/streams"
import { SharedThread, Thread } from "./schema/thread"
import { UsageEvent } from "./schema/usage"

export { Thread, Message, SharedThread, UsageEvent, UserSettings, Project, GuestSession }

export default defineSchema({
    threads: defineTable(Thread)
        .index("byAuthor", ["authorId"])
        .index("byGuestId", ["guestId"])
        .index("byProject", ["projectId"])
        .index("byAuthorAndProject", ["authorId", "projectId"])
        .searchIndex("search_title", {
            searchField: "title",
            filterFields: ["authorId"]
        }),

    messages: defineTable(Message)
        .index("byThreadId", ["threadId"])
        .index("byMessageId", ["messageId"]),

    sharedThreads: defineTable(SharedThread).index("byAuthorId", ["authorId"]),
    guestSessions: defineTable(GuestSession)
        .index("byGuestId", ["guestId"])
        .index("byClaimedUserId", ["claimedByUserId"]),
    streams: defineTable(ResumableStream).index("byThreadId", ["threadId"]),
    settings: defineTable(UserSettings).index("byUser", ["userId"]),

    usageEvents: defineTable(UsageEvent).index("byUserDay", ["userId", "daysSinceEpoch"]),

    projects: defineTable(Project)
        .index("byAuthor", ["authorId"])
        .searchIndex("search_name", {
            searchField: "name",
            filterFields: ["authorId"]
        }),

    loreChunks: defineTable({
        text: v.string(),
        embedding: v.array(v.float64()),
        book: v.string(),
        chapter: v.string(),
        chunkIndex: v.number(),
        dedupeKey: v.string()
    })
        .index("byDedupeKey", ["dedupeKey"])
        .vectorIndex("byEmbedding", {
            vectorField: "embedding",
            dimensions: 1536,
            filterFields: ["book"]
        })
})
