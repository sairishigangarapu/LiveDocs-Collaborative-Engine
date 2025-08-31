import { notFound } from 'next/navigation';

interface DocumentPageProps {
  params: { docId: string };
}

export default function DocumentPage({ params }: DocumentPageProps) {
  // For now, we'll redirect to 404 as requested
  // This prevents routing errors while maintaining the URL structure
  // Future implementation will display the actual document content
  
  // We can access the docId if needed: params.docId
  notFound();
}