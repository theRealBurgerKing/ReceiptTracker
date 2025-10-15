"use client";
import { useUser } from '@clerk/nextjs';
import {DndContext,useSensor,useSensors,PointerSensor} from '@dnd-kit/core';
import { useState, useCallback } from 'react';

export default function PDFDropzone() {

    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const {user} = useUser();
    // Set up sensors for drag detection
    const sensors = useSensors(useSensor(PointerSensor));
    
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
      console.log("Dropped");
    }, []);
    
    //const canUpload = isUserSignedIn && isFeatureEnabled;
    const canUpload = true;
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