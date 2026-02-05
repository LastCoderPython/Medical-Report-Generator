import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Report {
  id: string;
  created_at: string;
  patient_name: string;
  patient_mrn: string | null;
  patient_age: number | null;
  patient_gender: string | null;
  report_type: string;
  specialty: string;  // ← ADD THIS LINE
  report_content: string;
  diagnosis: string | null;
  icd10_codes: string[] | null;
  exam_date: string | null;
  user_id?: string | null;
  images?: string[] | null;
  // New optional fields
  created_by?: string | null;
  organization_id?: string | null;
  last_modified_by?: string | null;
  last_modified_at?: string | null;
  shared_with?: string[] | null;
  is_archived?: boolean;
  tags?: string[] | null;
}

export interface ReportTemplate {
  id: string;
  created_at: string;
  name: string;
  specialty: string;
  description: string | null;
  template_content: string;
  is_active: boolean;
}
