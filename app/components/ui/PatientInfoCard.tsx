import { z } from 'zod';

export const patientInfoSchema = z.object({
  name: z.string().describe("Patient's full name"),
  age: z.number().describe("Patient's age in years"),
  gender: z.enum(["Male", "Female", "Other"]).describe("Patient's gender"),
  mrn: z.string().describe("Medical Record Number (MRN)"),
  dateOfBirth: z.string().optional().describe("Date of birth in YYYY-MM-DD format"),
  examDate: z.string().describe("Date of examination in YYYY-MM-DD format"),
});

export type PatientInfoProps = z.infer<typeof patientInfoSchema>;

export function PatientInfoCard({
  name,
  age,
  gender,
  mrn,
  dateOfBirth,
  examDate,
}: PatientInfoProps) {
  return (
    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-semibold text-blue-600 border-b-2 border-blue-600 pb-2 mb-4">
        Patient Information
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase">Name:</label>
          <p className="text-base text-gray-900">{name}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase">Age:</label>
          <p className="text-base text-gray-900">{age} years</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase">Gender:</label>
          <p className="text-base text-gray-900">{gender}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase">MRN:</label>
          <p className="text-base text-gray-900">{mrn}</p>
        </div>
        {dateOfBirth && (
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">DOB:</label>
            <p className="text-base text-gray-900">{dateOfBirth}</p>
          </div>
        )}
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase">Exam Date:</label>
          <p className="text-base text-gray-900">{examDate}</p>
        </div>
      </div>
    </div>
  );
}
