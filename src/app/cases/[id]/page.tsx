'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import NoteList from '@/components/NoteList';
import CaseSummaryButton from '@/components/CaseSummaryButton';
import EditableCaseSummary from '@/components/EditableCaseSummary';
import Link from 'next/link';

export default function CaseDetailsPage() {
  const params = useParams();
  const caseId = params.id as string;
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/cases/${caseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch case details');
      }
      const data = await response.json();
      setPatient(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Case not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">{patient.name}</h1>
          <p className="text-gray-600">
            {patient.age} years • {patient.gender}
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/"
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Back to Cases
          </Link>
          {patient.status === 'open' && (
            <Link
              href={`/cases/${caseId}/edit`}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Edit Case
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Case Details</h2>
          {patient.status === 'open' && (
            <CaseSummaryButton caseId={caseId} onSuccess={fetchCaseDetails} />
          )}
        </div>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Reason for Admission:</span>{' '}
            {patient.reasonForAdmission}
          </p>
          <p>
            <span className="font-medium">Status:</span>{' '}
            <span
              className={`px-2 py-1 rounded-full text-sm ${
                patient.status === 'open'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {patient.status}
            </span>
          </p>
          {patient.dischargeDate && (
            <p>
              <span className="font-medium">Discharge Date:</span>{' '}
              {new Date(patient.dischargeDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {patient.caseSummary && (
        <EditableCaseSummary
          caseId={caseId}
          initialSummary={patient.caseSummary}
          onSave={fetchCaseDetails}
          isEditable={patient.status === 'closed'}
        />
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Clinical Notes</h2>
        <NoteList patientId={caseId} status={patient.status} _id={patient._id} />
      </div>
    </div>
  );
} 