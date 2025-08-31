'use client';

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { createNewDocument } from "../actions/actions";

function NewDocumentButton() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleCreateNewDocument = () => {
        // Clear any previous errors
        setError(null);

        startTransition(async () => {
            try {
                const result = await createNewDocument();

                if (result.success && result.docID) {
                    // Success - navigate to the document
                    router.push(`/doc/${result.docID}`);
                } else {
                    // Handle error from the action
                    setError(result.error || "Failed to create document");
                }
            } catch (err) {
                // Handle unexpected errors
                console.error('Unexpected error creating document:', err);
                setError("An unexpected error occurred. Please try again.");
            }
        });
    };

    return (
        <div className="flex flex-col items-start gap-2">
            <Button onClick={handleCreateNewDocument} disabled={isPending}>
                {isPending ? "Creating..." : "New Document"}
            </Button>
            {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">
                    {error}
                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={handleCreateNewDocument}
                            className="text-red-800 hover:text-red-900 font-medium underline"
                            disabled={isPending}
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-800 hover:text-red-900 font-medium"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NewDocumentButton;