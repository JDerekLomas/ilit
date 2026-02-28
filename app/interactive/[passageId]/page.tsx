"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Passage } from "@/lib/types";
import InteractiveShell from "@/components/interactive/InteractiveShell";

export default function InteractiveReaderPage() {
  const params = useParams();
  const router = useRouter();
  const passageId = params.passageId as string;
  const [passage, setPassage] = useState<Passage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/content/passages/${passageId}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Passage not found");
        return res.json();
      })
      .then(setPassage)
      .catch((err) => setError(err.message));
  }, [passageId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Passage not found</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard/assignments")}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  if (!passage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-pulse text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <InteractiveShell
      passage={passage}
      onExit={() => router.push("/dashboard/assignments")}
    />
  );
}
