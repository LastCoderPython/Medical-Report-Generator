import { z } from 'zod';

export const recommendationsSchema = z.object({
  diagnosis: z.string().describe("Primary clinical diagnosis or impression"),
  differentialDiagnoses: z.array(z.string()).optional().describe("Alternative possible diagnoses to consider"),
  immediateActions: z.array(z.string()).describe("Immediate clinical actions or treatments recommended"),
  followUpPlan: z.string().describe("Follow-up timeline and monitoring plan"),
  referrals: z.array(z.string()).optional().describe("Specialist referrals if needed"),
  patientEducation: z.string().optional().describe("Key points for patient education"),
  prognosisNotes: z.string().optional().describe("Expected outcome and prognosis"),
});

export type RecommendationsProps = z.infer<typeof recommendationsSchema>;

export function ClinicalRecommendations({
  diagnosis,
  differentialDiagnoses,
  immediateActions,
  followUpPlan,
  referrals,
  patientEducation,
  prognosisNotes,
}: RecommendationsProps) {
  return (
    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-semibold text-blue-600 border-b-2 border-blue-600 pb-2 mb-4">
        Assessment & Plan
      </h2>

      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-700">Primary Diagnosis</h3>
        <p className="text-lg font-medium text-gray-900 mt-1">{diagnosis}</p>
      </div>

      {differentialDiagnoses && differentialDiagnoses.length > 0 && (
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-700">Differential Diagnoses</h3>
          <ul className="list-disc list-inside mt-2 space-y-1">
            {differentialDiagnoses.map((dx, idx) => (
              <li key={idx} className="text-gray-700">{dx}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-700">Immediate Actions</h3>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          {immediateActions.map((action, idx) => (
            <li key={idx} className="text-gray-700">{action}</li>
          ))}
        </ol>
      </div>

      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-700">Follow-Up Plan</h3>
        <p className="text-gray-700 mt-1">{followUpPlan}</p>
      </div>

      {referrals && referrals.length > 0 && (
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-700">Referrals</h3>
          <ul className="list-disc list-inside mt-2 space-y-1">
            {referrals.map((ref, idx) => (
              <li key={idx} className="text-gray-700">{ref}</li>
            ))}
          </ul>
        </div>
      )}

      {patientEducation && (
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-700">Patient Education</h3>
          <p className="text-gray-700 mt-1">{patientEducation}</p>
        </div>
      )}

      {prognosisNotes && (
        <div>
          <h3 className="text-base font-semibold text-gray-700">Prognosis</h3>
          <p className="text-gray-700 mt-1">{prognosisNotes}</p>
        </div>
      )}
    </div>
  );
}
