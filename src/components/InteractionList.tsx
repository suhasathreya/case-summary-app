'use client'

interface Interaction {
  _id: string
  type: string
  date: string
  medicalStaff: {
    name: string
    role: string
  }
  observations: string
  vitals: {
    temperature?: number
    bloodPressure?: string
    heartRate?: number
    respiratoryRate?: number
    oxygenSaturation?: number
  }
  diagnosis?: string[]
  prescriptions?: {
    medicine: string
    dosage: string
    frequency: string
    duration: string
  }[]
  tests?: {
    name: string
    result: string
    date: string
  }[]
  notes?: string
}

interface Props {
  interactions: Interaction[]
}

export default function InteractionList({ interactions }: Props) {
  return (
    <div className="divide-y divide-gray-200">
      {interactions.length === 0 ? (
        <p className="p-6 text-gray-500">No interactions recorded yet.</p>
      ) : (
        interactions.map((interaction) => (
          <div key={interaction._id} className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {interaction.type}
                </h4>
                <p className="text-sm text-gray-500">
                  {new Date(interaction.date).toLocaleString()} by{' '}
                  {interaction.medicalStaff.name} ({interaction.medicalStaff.role})
                </p>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              <h5 className="text-sm font-medium text-gray-900">Observations</h5>
              <p className="text-gray-700">{interaction.observations}</p>
            </div>

            {(interaction.vitals.temperature ||
              interaction.vitals.bloodPressure ||
              interaction.vitals.heartRate ||
              interaction.vitals.respiratoryRate ||
              interaction.vitals.oxygenSaturation) && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Vitals</h5>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {interaction.vitals.temperature && (
                    <div>
                      <dt className="text-xs text-gray-500">Temperature</dt>
                      <dd className="text-sm text-gray-900">
                        {interaction.vitals.temperature}°C
                      </dd>
                    </div>
                  )}
                  {interaction.vitals.bloodPressure && (
                    <div>
                      <dt className="text-xs text-gray-500">Blood Pressure</dt>
                      <dd className="text-sm text-gray-900">
                        {interaction.vitals.bloodPressure}
                      </dd>
                    </div>
                  )}
                  {interaction.vitals.heartRate && (
                    <div>
                      <dt className="text-xs text-gray-500">Heart Rate</dt>
                      <dd className="text-sm text-gray-900">
                        {interaction.vitals.heartRate} bpm
                      </dd>
                    </div>
                  )}
                  {interaction.vitals.respiratoryRate && (
                    <div>
                      <dt className="text-xs text-gray-500">Respiratory Rate</dt>
                      <dd className="text-sm text-gray-900">
                        {interaction.vitals.respiratoryRate} breaths/min
                      </dd>
                    </div>
                  )}
                  {interaction.vitals.oxygenSaturation && (
                    <div>
                      <dt className="text-xs text-gray-500">O2 Saturation</dt>
                      <dd className="text-sm text-gray-900">
                        {interaction.vitals.oxygenSaturation}%
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}

            {interaction.diagnosis && interaction.diagnosis.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-1">Diagnosis</h5>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {interaction.diagnosis.map((diagnosis, index) => (
                    <li key={index}>{diagnosis}</li>
                  ))}
                </ul>
              </div>
            )}

            {interaction.prescriptions && interaction.prescriptions.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Prescriptions</h5>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medicine
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dosage
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Frequency
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {interaction.prescriptions.map((prescription, index) => (
                        <tr key={index}>
                          <td className="text-sm text-gray-900">{prescription.medicine}</td>
                          <td className="text-sm text-gray-900">{prescription.dosage}</td>
                          <td className="text-sm text-gray-900">{prescription.frequency}</td>
                          <td className="text-sm text-gray-900">{prescription.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {interaction.tests && interaction.tests.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Tests</h5>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Test
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Result
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {interaction.tests.map((test, index) => (
                        <tr key={index}>
                          <td className="text-sm text-gray-900">{test.name}</td>
                          <td className="text-sm text-gray-900">{test.result}</td>
                          <td className="text-sm text-gray-900">
                            {new Date(test.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {interaction.notes && (
              <div>
                <h5 className="text-sm font-medium text-gray-900">Additional Notes</h5>
                <p className="text-sm text-gray-700">{interaction.notes}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
} 