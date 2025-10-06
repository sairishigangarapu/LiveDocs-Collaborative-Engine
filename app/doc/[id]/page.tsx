import Document from "@/components/Document";
import { Suspense } from "react";

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { id } = await params;
  
  return (
    <div>
      <Suspense fallback={<div>Loading document...</div>}>
        <DocumentWrapper id={id} />
      </Suspense>
    </div>
  );
}

// Client component wrapper to ensure params is properly handled
function DocumentWrapper({ id }: { id: string }) {
  return <Document id={id} />;
}