import { v } from "convex/values"
import { internal } from "../_generated/api"
import { action, internalMutation, internalQuery } from "../_generated/server"

const OPENROUTER_EMBEDDING_MODEL = "openai/text-embedding-3-small"

async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey)
        throw new Error("OPENROUTER_API_KEY environment variable is required for embeddings")

    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            input: text,
            model: OPENROUTER_EMBEDDING_MODEL
        })
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`OpenRouter embedding API error: ${response.status} ${err}`)
    }

    const data = await response.json()
    return data.data[0].embedding
}

export const checkDuplicate = internalQuery({
    args: { dedupeKey: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("loreChunks")
            .withIndex("byDedupeKey", (q) => q.eq("dedupeKey", args.dedupeKey))
            .first()
        return existing !== null
    }
})

export const insertChunk = internalMutation({
    args: {
        text: v.string(),
        embedding: v.array(v.float64()),
        book: v.string(),
        chapter: v.string(),
        chunkIndex: v.number(),
        dedupeKey: v.string()
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("loreChunks", args)
    }
})

export const ingestChunk = action({
    args: {
        text: v.string(),
        book: v.string(),
        chapter: v.string(),
        chunkIndex: v.number(),
        dedupeKey: v.string()
    },
    handler: async (ctx, args) => {
        const isDuplicate = await ctx.runQuery(internal.lib.asoiaf_rag.checkDuplicate, {
            dedupeKey: args.dedupeKey
        })
        if (isDuplicate) return { status: "skipped", reason: "duplicate" }

        const embedding = await generateEmbedding(args.text)

        await ctx.runMutation(internal.lib.asoiaf_rag.insertChunk, {
            text: args.text,
            embedding,
            book: args.book,
            chapter: args.chapter,
            chunkIndex: args.chunkIndex,
            dedupeKey: args.dedupeKey
        })

        return { status: "ingested" }
    }
})

export const ingestBatch = action({
    args: {
        chunks: v.array(
            v.object({
                text: v.string(),
                book: v.string(),
                chapter: v.string(),
                chunkIndex: v.number(),
                dedupeKey: v.string()
            })
        )
    },
    handler: async (ctx, args) => {
        let ingested = 0
        let skipped = 0

        for (const chunk of args.chunks) {
            const isDuplicate = await ctx.runQuery(internal.lib.asoiaf_rag.checkDuplicate, {
                dedupeKey: chunk.dedupeKey
            })
            if (isDuplicate) {
                skipped++
                continue
            }

            const embedding = await generateEmbedding(chunk.text)

            await ctx.runMutation(internal.lib.asoiaf_rag.insertChunk, {
                text: chunk.text,
                embedding,
                book: chunk.book,
                chapter: chunk.chapter,
                chunkIndex: chunk.chunkIndex,
                dedupeKey: chunk.dedupeKey
            })
            ingested++
        }

        return { ingested, skipped }
    }
})

export const searchLore = action({
    args: {
        query: v.string(),
        limit: v.optional(v.number()),
        book: v.optional(v.string())
    },
    handler: async (
        ctx,
        args
    ): Promise<Array<{ text: string; book: string; chapter: string; score: number }>> => {
        const queryEmbedding = await generateEmbedding(args.query)
        const resolvedLimit = args.limit ?? 8

        const results = await ctx.vectorSearch("loreChunks", "byEmbedding", {
            vector: queryEmbedding,
            limit: resolvedLimit,
            filter: args.book ? (q) => q.eq("book", args.book!) : undefined
        })

        const chunks: Array<{ text: string; book: string; chapter: string; score: number } | null> =
            await Promise.all(
                results.map(
                    async (
                        result
                    ): Promise<{
                        text: string
                        book: string
                        chapter: string
                        score: number
                    } | null> => {
                        const doc = await ctx.runQuery(
                            (internal as any).lib.asoiaf_rag.getChunkById,
                            {
                                id: result._id
                            }
                        )
                        return doc
                            ? {
                                  text: doc.text,
                                  book: doc.book,
                                  chapter: doc.chapter,
                                  score: result._score
                              }
                            : null
                    }
                )
            )

        return chunks.filter(
            (chunk): chunk is { text: string; book: string; chapter: string; score: number } =>
                chunk !== null
        )
    }
})

export const getChunkById = internalQuery({
    args: { id: v.id("loreChunks") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id)
    }
})

export const getIngestionStats = action({
    args: {},
    handler: async (ctx): Promise<{ total: number; byBook: Record<string, number> }> => {
        const stats = await ctx.runQuery((internal as any).lib.asoiaf_rag.countChunks, {})
        return stats
    }
})

export const countChunks = internalQuery({
    args: {},
    handler: async (ctx) => {
        const chunks = await ctx.db.query("loreChunks").collect()
        const bookCounts: Record<string, number> = {}
        for (const chunk of chunks) {
            bookCounts[chunk.book] = (bookCounts[chunk.book] ?? 0) + 1
        }
        return { total: chunks.length, byBook: bookCounts }
    }
})
