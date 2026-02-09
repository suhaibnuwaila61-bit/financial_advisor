import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { z } from "zod";

interface TransactionData {
  amount: string;
  type: "expense" | "income" | "investment" | "savings" | "budget" | "lent" | "borrowed";
  category: string;
  description: string;
  date?: Date;
}

/**
 * Parse transaction details from user description and optional image
 */
export async function parseTransactionFromDescription(
  description: string,
  imageBase64?: string
): Promise<{ message: string; transactionData?: TransactionData }> {
  try {
    // Build the message content with image if provided
    const messageContent: Array<{ type: string; [key: string]: unknown }> = [];

    if (imageBase64) {
      // Extract base64 data if it includes the data URI prefix
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
      text: description
    });

    // Call LLM to extract transaction details
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a financial transaction parser. Extract transaction details from user descriptions and images of receipts.
          
Return a JSON object with the following structure:
{
  "amount": "number as string",
  "type": "expense|income|investment|savings|budget|lent|borrowed",
  "category": "category name",
  "description": "transaction description",
  "date": "YYYY-MM-DD or null"
}

Rules:
- If it's a receipt image, extract the total amount
- Infer the transaction type from context (shopping = expense, salary = income, etc.)
- For investments, use type "investment"
- For savings deposits, use type "savings"
- For budget tracking, use type "budget"
- For lending/borrowing, use type "lent" or "borrowed"
- Always return valid JSON
- If you cannot extract enough information, return null for uncertain fields`
        },
        {
          role: "user",
          content: messageContent as any
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "transaction_data",
          strict: true,
          schema: {
            type: "object",
            properties: {
              amount: { type: "string", description: "Transaction amount" },
              type: {
                type: "string",
                enum: ["expense", "income", "investment", "savings", "budget", "lent", "borrowed"],
                description: "Type of transaction"
              },
              category: { type: "string", description: "Category name" },
              description: { type: "string", description: "Transaction description" },
              date: { type: ["string", "null"], description: "Date in YYYY-MM-DD format or null" }
            },
            required: ["amount", "type", "category", "description"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        message: "I couldn't extract transaction details. Please provide more information about the amount and type of transaction."
      };
    }

    const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));

    // Validate parsed data
    if (!parsed.amount || !parsed.type || !parsed.category) {
      return {
        message: `I found some details but need clarification:\n- Amount: ${parsed.amount || "missing"}\n- Type: ${parsed.type || "missing"}\n- Category: ${parsed.category || "missing"}\n\nPlease provide the missing information.`
      };
    }

    const transactionData: TransactionData = {
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      description: parsed.description || "Transaction",
      date: parsed.date ? new Date(parsed.date) : undefined
    };

    return {
      message: `Great! I found a ${transactionData.type} transaction:\n- Amount: $${transactionData.amount}\n- Category: ${transactionData.category}\n- Description: ${transactionData.description}\n\nI'll create this transaction for you.`,
      transactionData
    };
  } catch (error) {
    console.error("Error parsing transaction:", error);
    return {
      message: "I encountered an error processing your request. Please try again with a clearer description."
    };
  }
}

/**
 * Create transaction from parsed data
 */
export async function createTransactionFromParsedData(
  userId: number,
  transactionData: TransactionData
): Promise<{ success: boolean; message: string; transactionId?: number }> {
  try {
    // Get or create category
    let categories = await db.getCategories(userId);
    let category = categories.find(c => c.name.toLowerCase() === transactionData.category.toLowerCase());

    if (!category) {
      // Create new category
      const newCategoryResult = await db.createCategory(
        userId,
        transactionData.category,
        transactionData.type === "income" ? "income" : "expense"
      );
      if (newCategoryResult) {
        category = newCategoryResult as any;
      }
    }

    if (!category) {
      return {
        success: false,
        message: "Failed to create or find category"
      };
    }

    // Create transaction
    const transaction = await db.createTransaction(
      userId,
      (category as any).id,
      transactionData.amount,
      transactionData.type === "income" ? "income" : "expense",
      transactionData.description,
      transactionData.date
    );

    return {
      success: true,
      message: `✅ Transaction created successfully! ${transactionData.type} of $${transactionData.amount} in ${transactionData.category}`,
      transactionId: (transaction as any)?.id
    };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return {
      success: false,
      message: "Failed to create transaction. Please try again."
    };
  }
}
