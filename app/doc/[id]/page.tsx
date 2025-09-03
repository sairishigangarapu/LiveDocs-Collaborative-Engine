import Document from '@/components/Document';

interface DocumentPageProps {
  params: {
    id: string;
  };
}

export default function DocumentPage({ params }: DocumentPageProps) {
  return (
    <div>
      <Document id={params.id} />
    </div>
  );
}
