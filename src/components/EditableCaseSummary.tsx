'use client';

import { useState, useEffect } from 'react';

interface EditableCaseSummaryProps {
  caseId: string;
  initialSummary: string;
  onSave?: () => void;
  isEditable?: boolean;
}

export default function EditableCaseSummary({ 
  caseId, 
  initialSummary, 
  onSave,
  isEditable = false 
}: EditableCaseSummaryProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSummary(initialSummary);
  }, [initialSummary]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseSummary: summary }),
      });

      if (!response.ok) {
        throw new Error('Failed to save summary');
      }

      setIsEditing(false);
      onSave?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Case Summary</h2>
          <div className="space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter case summary..."
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Case Summary</h2>
        {isEditable && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Edit
          </button>
        )}
      </div>
      <div className="prose max-w-none">
        {summary.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4">{paragraph}</p>
        ))}
      </div>
    </div>
  );
} 