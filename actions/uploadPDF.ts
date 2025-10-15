'use server'

import { api } from "@/convex/_generated/api";
import { currentUser } from "@clerk/nextjs/server";
import convex from "@/lib/convexClient";
import { getFileDownloadUrl } from "./getFileDownloadUrl";


export async function uploadPDF(formData: FormData) {
    const user = await currentUser();
    if(!user) {
        return { success: false, error: 'Not authenticated' };
    }
    try{
        const file = formData.get('file') as File;
        if(!file) {
            return { success: false, error: 'File not found' };
        }
        
        // Validate file
        if(
            !file.type.includes("pdf") &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            return { success: false, error: 'Invalid file type' };
        }

        // Get upload URL from Convex
        const uploadUrl = await convex.mutation(api.receipts.generateUploadUrl, {});
        
        
        // Convert file to arrayBuffer for fetch API
        const arrayBuffer = await file.arrayBuffer();

        // Upload the file to Convex storage
        const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                "Content-Type": file.type,
            },
            body: new Uint8Array(arrayBuffer),
        });
        
        if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
          }
          
          // Get storage ID from the response
          const { storageId } = await uploadResponse.json();
          // Add receipt to the database
        const receiptId = await convex.mutation(api.receipts.storeReceipt, {
            userId: user.id,
            fileId: storageId,
            fileName: file.name,
            size: file.size,
            mimeType: file.type,
        });
        // Generate the file URL
        const fileUrl = await getFileDownloadUrl(storageId);

        //TODO

        return{
            success: true,
            data: {
                receiptId,
                fileName: file.name,
            }
        }
    } catch (error) {
        console.error('Failed to upload PDF', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to upload PDF' };
    }
}