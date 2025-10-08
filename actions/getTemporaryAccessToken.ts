'use server'

import { currentUser } from "@clerk/nextjs/server";

// Initialize Schematic SDK
import { SchematicClient } from "@schematichq/schematic-typescript-node";

const apiKey = process.env.SCHEMATIC_API_KEY;
const client = new SchematicClient({ apiKey });

// Get a temporary access token
export async function getTemporaryAccessToken() {
    console.log("Getting temporary access token");
    const user = await currentUser();
  
    if (!user) {
      console.log("No user found, returning null");
      return null;
    }

    console.log(`User found: ${user.id}, returning temporary access token`);

    const resp = await client.accesstokens.issueTemporaryAccessToken({
        resource_type: "company",
        lookup: { id: user.id }, // The lookup will vary depending on how you have configured your company keys
    });

    console.log(
    "Token response received:",
    resp.data ? "Token received" : "No token in response",
    );

    return resp.data?.token;
}