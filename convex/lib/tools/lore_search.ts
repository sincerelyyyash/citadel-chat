import { tool } from "ai"
import { z } from "zod"
import { api } from "../../_generated/api"
import type { ToolAdapter } from "../toolkit"

export const LoreSearchAdapter: ToolAdapter = async (params) => {
    return {
        search_lore: tool({
            description:
                "Search the ASOIAF book texts and lore knowledge base for specific information about characters, events, houses, battles, prophecies, and history from A Song of Ice and Fire.",
            parameters: z.object({
                query: z
                    .string()
                    .describe(
                        "The lore query to search for (e.g. 'Red Wedding', 'Targaryen lineage')"
                    ),
                book: z
                    .string()
                    .optional()
                    .describe(
                        "Optional: filter by book title (e.g. 'A Game Of Thrones', 'A Storm of Swords')"
                    )
            }),
            execute: async ({ query, book }) => {
                try {
                    const results = await params.ctx.runAction(api.lib.asoiaf_rag.searchLore, {
                        query,
                        limit: 6,
                        book: book ?? undefined
                    })

                    if (!results || results.length === 0) {
                        return {
                            success: true,
                            query,
                            results: [],
                            message:
                                "No matching lore passages found. Answer from your own knowledge."
                        }
                    }

                    return {
                        success: true,
                        query,
                        results: results.map(
                            (r: {
                                text: string
                                book: string
                                chapter: string
                                score: number
                            }) => ({
                                text: r.text,
                                book: r.book,
                                chapter: r.chapter,
                                relevance: r.score
                            })
                        ),
                        count: results.length
                    }
                } catch (error) {
                    console.error("Lore search error:", error)
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : "Unknown error",
                        query,
                        results: []
                    }
                }
            }
        })
    }
}
