import { Button } from "@/components/ui/button";
import { ArrowLeftCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="flex spae-x-2 items-center animate-pulse">
      <ArrowLeftCircle/>
      <h1 className="font-bold">
        Get started with creating a New Document
      </h1>
    </main>
  );
}
