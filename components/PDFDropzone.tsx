"use client";
import { useUser } from '@clerk/nextjs';
import {DndContext,useSensor,useSensors,PointerSensor} from '@dnd-kit/core';
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSchematicEntitlement } from '@schematichq/schematic-react';
import { uploadPDF } from '@/actions/uploadPDF';

export default function PDFDropzone() {

    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [isDragingOver, setIsDragingOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();
    const {user} = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {value: isFeatureEnabled,
      featureUsageExceeded,
      featureUsage,
      featureAllocation,
    } = useSchematicEntitlement('scans');


    console.log('isFeatureEnabled', isFeatureEnabled);
    // Set up sensors for drag detection
    const sensors = useSensors(useSensor(PointerSensor));


    const handleUpload = useCallback(
      async (files: FileList | File[]) => {
        if(!user) {
          alert('Please sign in to upload receipts');
          return;
        }
        const fileArray = Array.from(files);
        const pdfFiles = fileArray.filter(file => file.type === 'application/pdf'
          || file.name.toLowerCase().endsWith('.pdf'));
        if(pdfFiles.length === 0) {
          alert('Please upload only PDF files');
          return;
        }
        setIsUploading(true);

        try {
          // Upload files
          const newUploadedFiles: string[] = [];
        
          for (const file of pdfFiles) {
            // Create a FormData object to use with the server action
            const formData = new FormData();
            formData.append("file", file);

            const result = await uploadPDF(formData);

            if(!result.success) {
              throw new Error(result.error);
            }

            newUploadedFiles.push(file.name);
          }
          setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);

          //clear uploaded files list after 5 sec
          setTimeout(() => {
            setUploadedFiles([]);
          }, 5000);
          router.push('/receipts');
        } catch (error) {
          console.error("Upload failed:", error);
          alert(
            `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        } finally {
          setIsUploading(false);
        }
      },
      [user, router],
    );
    
    // Handle file drop via native browser events for better PDF support
    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(true);
    }, []);
    
    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
    }, []);
    
    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      if(!user) {
        alert('Please sign in to upload receipts');
        return;
      }
      if(e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    }, [user,handleUpload]);
    
    const isUserSignedIn = !!user;
    const canUpload = isUserSignedIn && isFeatureEnabled;
    return (
        <DndContext sensors={sensors}>
            <div className="w-full max-w-md mx-auto bg-red-400">
                <div
                    onDragOver={canUpload ? handleDragOver : undefined}
                    onDragLeave={canUpload ? handleDragLeave : undefined}
                    onDrop={canUpload ? handleDrop : (e) => e.preventDefault()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDraggingOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    } ${!canUpload ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                    PDFDropzone
                </div>
            </div>
        </DndContext>
    );
}