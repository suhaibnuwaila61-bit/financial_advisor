import { invokeLLM } from "./_core/llm";
import * as db from "./db";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ConversationContext {
  userId: number;
  messages: ChatMessage[];
  extractedInfo: {
    income?: string;
    savingsGoal?: string;
    investmentGoal?: string;
    expenses?: string;
    categories?: string[];
  };
}

/**
 * Process a multi-turn conversation with context awareness
 */
export async function processFinancialConversation(
  userId: number,
  userMessage: string,
  conversationHistory: ChatMessage[],
  imageBase64?: string
): Promise<{
  message: string;
  transactionCreated?: boolean;
  extractedInfo?: Record<string, unknown>;
  suggestedActions?: string[];
}> {
  try {
    // Build the conversation context
    const systemPrompt = `You are an advanced AI investing analyst and strategist specializing in stock markets. You combine fundamental analysis, technical analysis, macroeconomic context, and behavioral finance to deliver clear, actionable, and risk-aware insights. You think like a disciplined portfolio manager, not a hype-driven trader.

CORE MISSION:
Help the user make better stock investment decisions by:
- Explaining concepts clearly and accurately
- Analyzing stocks, sectors, and markets objectively
- Identifying risks, trade-offs, and assumptions
- Supporting long-term, sustainable investing strategies
- NOT providing financial guarantees or encouraging reckless speculation

ANALYTICAL FRAMEWORK:
When responding to investing-related requests, follow this structure:

1. CLARIFY THE GOAL:
   - Long-term investing vs. short-term trading
   - Growth, value, income, or speculative intent
   - Risk tolerance (low / medium / high) when relevant

2. ANALYSIS METHOD SELECTION:
   - Fundamental: Financials, valuation, moat, management, growth drivers
   - Technical: Trends, support/resistance, momentum, volume
   - Macro: Interest rates, inflation, economic cycle, geopolitics
   - Comparative: Peer and sector benchmarking

3. INSIGHT DELIVERY:
   - Key findings in plain language
   - Bull case vs. bear case
   - What would need to go right — and what could go wrong

4. RISK & UNCERTAINTY DISCLOSURE:
   - Highlight assumptions
   - Call out data limitations or changing conditions
   - Avoid absolute predictions

BEHAVIORAL & RISK PRINCIPLES:
Always:
- Emphasize risk management and diversification
- Distinguish facts from opinions
- Avoid hype, FOMO language, or meme-stock bias
- Encourage critical thinking over blind following

Never:
- Claim certainty about future prices
- Present speculation as guaranteed outcomes
- Push excessive leverage or all-in strategies

RESPONSE STYLE:
- Be structured, concise, and professional
- Use bullet points, tables, or step-by-step logic when helpful
- Match the user's sophistication level
- Treat all content as educational, not personalized financial advice
- Remind the user that markets are uncertain and outcomes vary

For non-investing financial questions, provide expert financial advisory while maintaining the same principles of clarity, risk awareness, and long-term thinking.`;

    // Build message content with image if provided
    const messageContent: Array<{ type: string; [key: string]: unknown }> = [];

    if (imageBase64) {
      const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
      messageContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Data}`,
          detail: "high"
        }
      });
    }

    messageContent.push({
      type: "text",
      text: userMessage
    });

    // Prepare messages for LLM including conversation history
    const llmMessages: Array<{ role: string; content: unknown }> = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // Add conversation history
    for (const msg of conversationHistory) {
      llmMessages.push({
        role: msg.role,
        content: msg.content
      });
    }

    // Add current user message
    llmMessages.push({
      role: "user",
      content: messageContent
    });

    // Call LLM with conversation history
    const response = await invokeLLM({
      messages: llmMessages as any,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "financial_conversation_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              response: {
                type: "string",
                description: "Conversational response to the user"
              },
              extractedInfo: {
                type: "object",
                properties: {
                  income: { type: ["string", "null"] },
                  savingsGoal: { type: ["string", "null"] },
                  investmentGoal: { type: ["string", "null"] },
                  expenses: { type: ["string", "null"] },
                  categories: { type: "array", items: { type: "string" } }
                },
                additionalProperties: false
              },
              suggestedActions: {
                type: "array",
                items: { type: "string" },
                description: "Suggested next steps for the user"
              },
              shouldCreateTransaction: {
                type: "boolean",
                description: "Whether a transaction should be created from this conversation"
              },
              transactionDetails: {
                type: "object",
                properties: {
                  amount: { type: ["string", "null"] },
                  type: {
                    type: "string",
                    enum: ["expense", "income", "investment", "savings", "budget", "lent", "borrowed"]
                  },
                  category: { type: "string" },
                  description: { type: "string" }
                },
                additionalProperties: false
              }
            },
            required: ["response", "extractedInfo", "suggestedActions", "shouldCreateTransaction"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        message: "I apologize, I couldn't process your message. Please try again."
      };
    }

    const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));

    // Process extracted information
    let transactionCreated = false;
    if (parsed.shouldCreateTransaction && parsed.transactionDetails?.amount) {
      try {
        transactionCreated = await createTransactionFromConversation(userId, parsed.transactionDetails);
      } catch (error) {
        console.error("Error creating transaction:", error);
      }
    }

    return {
      message: parsed.response,
      transactionCreated,
      extractedInfo: parsed.extractedInfo,
      suggestedActions: parsed.suggestedActions
    };
  } catch (error) {
    console.error("Error processing financial conversation:", error);
    return {
      message: "I encountered an error processing your message. Please try again with a clearer description."
    };
  }
}

/**
 * Create transaction from conversation context
 */
async function createTransactionFromConversation(
  userId: number,
  transactionDetails: {
    amount: string;
    type: string;
    category: string;
    description: string;
  }
): Promise<boolean> {
  try {
    // Get or create category
    let categories = await db.getCategories(userId);
    let categoryId: number | null = null;
    
    // Find existing category
    const existingCategory = categories.find(c => c.name.toLowerCase() === transactionDetails.category.toLowerCase());
    if (existingCategory) {
      categoryId = (existingCategory as any).id;
    } else {
      // Create new category
      const newCategoryResult = await db.createCategory(
        userId,
        transactionDetails.category,
        transactionDetails.type === "income" ? "income" : "expense"
      );
      
      // Extract ID from the insert result
      if (newCategoryResult && (newCategoryResult as any).insertId) {
        categoryId = (newCategoryResult as any).insertId;
      } else if (newCategoryResult && (newCategoryResult as any).id) {
        categoryId = (newCategoryResult as any).id;
      }
    }

    if (!categoryId) {
      console.error("Failed to get or create category");
      return false;
    }

    // Create transaction
    await db.createTransaction(
      userId,
      categoryId,
      transactionDetails.amount,
      transactionDetails.type === "income" ? "income" : "expense",
      transactionDetails.description
    );

    return true;
  } catch (error) {
    console.error("Error creating transaction from conversation:", error);
    return false;
  }
}

/**
 * Analyze conversation for financial insights
 */
export async function extractFinancialInsights(
  conversationHistory: ChatMessage[]
): Promise<{
  income?: string;
  expenses?: string;
  savingsGoal?: string;
  investmentGoal?: string;
  summary: string;
}> {
  try {
    const conversationText = conversationHistory
      .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Extract financial information from the conversation. Return a JSON object with income, expenses, savingsGoal, investmentGoal, and a summary."
        },
        {
          role: "user",
          content: conversationText
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "financial_insights",
          strict: true,
          schema: {
            type: "object",
            properties: {
              income: { type: ["string", "null"] },
              expenses: { type: ["string", "null"] },
              savingsGoal: { type: ["string", "null"] },
              investmentGoal: { type: ["string", "null"] },
              summary: { type: "string" }
            },
            required: ["summary"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { summary: "Unable to extract insights from conversation" };
    }

    return JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
  } catch (error) {
    console.error("Error extracting financial insights:", error);
    return { summary: "Unable to extract insights from conversation" };
  }
}
