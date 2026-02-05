import { z } from 'zod';

const findingSchema = z.object({
  anatomicalLocation: z.string().describe("Specific anatomical location (e.g., 'Macula', 'Optic Disc', 'Peripheral Retina')"),
  observation: z.string().describe("Clinical observation or abnormality detected"),
  severity: z.enum(["Normal", "Mild", "Moderate", "Severe"]).optional(),
  measurementValue: z.string().optional().describe("Quantitative measurement if applicable (e.g., 'Central Subfield Thickness: 245 μm')"),
});

export const findingsSchema = z.object({
  chiefComplaint: z.string().describe("Primary reason for examination or patient's main symptom"),
  findings: z.array(findingSchema).describe("Array of individual clinical findings"),
  additionalObservations: z.string().optional().describe("Any other relevant clinical observations"),
});

export type FindingsProps = z.infer<typeof findingsSchema>;

export function FindingsCard({
  chiefComplaint,
  findings,
  additionalObservations,
}: FindingsProps) {
  const severityColors: Record<string, string> = {
    Normal: "bg-green-500",
    Mild: "bg-yellow-400",
    Moderate: "bg-orange-500",
    Severe: "bg-red-600",
  };

  return (
    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-semibold text-blue-600 border-b-2 border-blue-600 pb-2 mb-4">
        Clinical Findings
      </h2>
      
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-700">Chief Complaint</h3>
        <p className="text-base text-gray-900 mt-1">{chiefComplaint}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-3">Examination Findings</h3>
        <div className="space-y-3">
          {findings.map((finding, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
              <div className="flex justify-between items-start mb-2">
                <strong className="text-gray-900">{finding.anatomicalLocation}</strong>
                {finding.severity && (
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${severityColors[finding.severity]}`}
                  >
                    {finding.severity}
                  </span>
                )}
              </div>
              <p className="text-gray-700">{finding.observation}</p>
              {finding.measurementValue && (
                <div className="mt-2">
                  <em className="text-sm text-gray-600">{finding.measurementValue}</em>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {additionalObservations && (
        <div className="mt-4">
          <h3 className="text-base font-semibold text-gray-700">Additional Observations</h3>
          <p className="text-base text-gray-700 mt-1">{additionalObservations}</p>
        </div>
      )}
    </div>
  );
}
