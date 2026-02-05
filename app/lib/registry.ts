import { TamboComponent } from '@tambo-ai/react';

// Import components
import { PatientInfoCard, patientInfoSchema } from '@/app/components/ui/PatientInfoCard';
import { ImagingMetadata, imagingMetadataSchema } from '@/app/components/ui/ImagingMetadata';
import { FindingsCard, findingsSchema } from '@/app/components/ui/FindingsCard';
import { ClinicalRecommendations, recommendationsSchema } from '@/app/components/ui/ClinicalRecommendations';
import { ReportSummary, reportSummarySchema } from '@/app/components/ui/ReportSummary';

export const components: TamboComponent[] = [
  {
    name: "PatientInfo",
    description: "Display patient demographic information including name, age, gender, MRN, and exam date. Use this when doctor mentions patient details at the beginning of a clinical encounter.",
    component: PatientInfoCard,
    propsSchema: patientInfoSchema,
  },
  {
    name: "ImagingMetadata",
    description: "Display imaging technical details including modality type (fundus, OCT, FA), laterality (OD/OS/OU), image quality, and equipment used. Use when doctor describes the imaging procedure or equipment.",
    component: ImagingMetadata,
    propsSchema: imagingMetadataSchema,
  },
  {
    name: "ClinicalFindings",
    description: "Display structured clinical examination findings organized by anatomical location (macula, optic disc, vessels, peripheral retina). Use when doctor describes what they observe in the retinal images or during examination.",
    component: FindingsCard,
    propsSchema: findingsSchema,
  },
  {
    name: "ClinicalRecommendations",
    description: "Display assessment, diagnosis, treatment plan, follow-up schedule, and referrals. Use when doctor provides their clinical impression and management plan.",
    component: ClinicalRecommendations,
    propsSchema: recommendationsSchema,
  },
  {
    name: "ReportSummary",
    description: "Display final summary of the entire clinical encounter with critical findings highlighted. Use at the end to provide executive summary of the complete report.",
    component: ReportSummary,
    propsSchema: reportSummarySchema,
  },
];
