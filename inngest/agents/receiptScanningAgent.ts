import { createAgent, createTool, openai, anthropic } from "@inngest/agent-kit";
import { z } from "zod";



const parsePdfTool = createTool({
    name: "parse-pdf",
    description: "Analyzes the given PDF",
    parameters: z.object({
      pdfUrl: z.string(),
    }),
    handler: async ({ pdfUrl }, { step }) => {
        try{
        return await step?.ai.infer("parse-pdf", {
          model: anthropic({
            model: "claude-3-7-sonnet-20250219",
            defaultParameters: {
              max_tokens: 3094,
            },
          }),
          body: {
            messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "document",
                      source: {
                        type: "url",
                        url: pdfUrl,
                      },
                    },
                    
                    
                    {
                        type: "text",
                        text: `Extract the data from the receipt and return the structured output as follows:

IMPORTANT FIELD DEFINITIONS:
- unit_price: The price per unit/item. If only total price is shown, set unit_price = line_total
- line_total: The total for this specific item line (quantity * unit_price)
- totals.total: The final amount paid including all taxes

PRICING RULES:
- If receipt shows both unit price and total: use actual values
- If receipt only shows total price: set unit_price = line_total, quantity = 1
- If receipt shows quantity and total: calculate unit_price = line_total / quantity

EXAMPLES:
1. Detailed receipt: "Apple 3 x $1.50 = $4.50" → unit_price: 1.50, quantity: 3, line_total: 4.50
2. Service receipt: "UberX Ride $20.22" → unit_price: 20.22, quantity: 1, line_total: 20.22
3. Quantity receipt: "Bread 2 x $4.00" → unit_price: 2.00, quantity: 2, line_total: 4.00

{
  "merchant": {
    "name": "Store Name",
    "address": "123 Main St, City, Country",
    "contact": "+123456789"
  },
  "transaction": {
    "date": "YYYY-MM-DD",
    "receipt_number": "ABC123456",
    "payment_method": "Credit Card"
  },
  "items": [
    {
      "name": "Item 1",
      "quantity": 2,
      "unit_price": 10.00,
      "line_total": 20.00
    }
  ],
  "totals": {
    "subtotal": 20.00,
    "tax": 2.00,
    "total": 22.00,
    "currency": "USD"
  }
}`
                      }
                  ],
                  
                },
              ],
          },
        });
        } catch (error) {
            console.error("Error parsing PDF", error);
            throw error;
        }
    },
  });


  export const receiptScanningAgent = createAgent({
    name: "Receipt Scanning Agent",
    description: `Processes receipt images and PDFs to extract key information such as 
      vendor names, dates, amounts, and line items`,
    system: `You are an AI-powered receipt scanning assistant. Your primary role is to 
      accurately extract and structure relevant information from scanned receipts. 
      Your task includes recognizing and parsing details such as:
      
      • Merchant Information: Store name, address, contact details
      • Transaction Details: Date, time, receipt number, payment method
      • Itemized Purchases: Product names, quantities, individual prices, discounts
      • Total Amounts: Total paid, Amount paid
      • Ensure high accuracy by detecting OCR errors and correcting misread text when possible.
      • Normalize dates, currency values, and formatting for consistency.
      • If any key details are missing or unclear, return a structured response indicating incomplete data.
      • Handle multiple formats, languages, and varying receipt layouts efficiently.
      • Maintain a structured JSON output for easy integration with databases or expense tracking systems.`,
    model: openai({
      model: "gpt-4o-mini",
      defaultParameters: {
        max_completion_tokens: 3094,
      },
    }),
    tools: [parsePdfTool],
  });