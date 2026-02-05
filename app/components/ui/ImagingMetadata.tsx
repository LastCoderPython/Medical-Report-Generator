import { z } from 'zod';

export const imagingMetadataSchema = z.object({
  modalityType: z.enum([
    "Color Fundus Photography",
    "Fluorescein Angiography",
    "Optical Coherence Tomography (OCT)",
    "OCT Angiography",
    "Fundus Autofluorescence"
  ]).describe("Type of retinal imaging modality used"),
  laterality: z.enum(["Right Eye (OD)", "Left Eye (OS)", "Both Eyes (OU)"]),
  imagingDevice: z.string().optional().describe("Device/camera model used"),
  imageQuality: z.enum(["Excellent", "Good", "Fair", "Poor"]).describe("Overall image quality assessment"),
  pupilDilation: z.boolean().describe("Whether pupil was dilated"),
  technicalNotes: z.string().optional().describe("Any technical observations about image acquisition"),
});

export type ImagingMetadataProps = z.infer<typeof imagingMetadataSchema>;

export function ImagingMetadata({
  modalityType,
  laterality,
  imagingDevice,
  imageQuality,
  pupilDilation,
  technicalNotes,
}: ImagingMetadataProps) {
  const qualityColors: Record<string, string> = {
    Excellent: "bg-green-100 text-green-800",
    Good: "bg-blue-100 text-blue-800",
    Fair: "bg-yellow-100 text-yellow-800",
    Poor: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-semibold text-blue-600 border-b-2 border-blue-600 pb-2 mb-4">
        Imaging Details
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase">Modality:</label>
          <p className="text-base text-gray-900">{modalityType}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase">Laterality:</label>
          <p className="text-base text-gray-900">{laterality}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase">Image Quality:</label>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${qualityColors[imageQuality]}`}>
            {imageQuality}
          </span>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase">Pupil Status:</label>
          <p className="text-base text-gray-900">{pupilDilation ? "Dilated" : "Undilated"}</p>
        </div>
        {imagingDevice && (
          <div className="col-span-2">
            <label className="text-xs font-semibold text-gray-600 uppercase">Device:</label>
            <p className="text-base text-gray-900">{imagingDevice}</p>
          </div>
        )}
      </div>
      {technicalNotes && (
        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-600 uppercase">Technical Notes:</label>
          <p className="text-base text-gray-700 mt-1">{technicalNotes}</p>
        </div>
      )}
    </div>
  );
}
