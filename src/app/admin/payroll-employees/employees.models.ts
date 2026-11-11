export interface Meta { page: number; per_page: number; total: number; last_page: number; }

export interface EmployeeRow {
  id: number;
  name: string;
  job_title: string | null;
  email: string | null;
  mobile: string | null;
  employment_basis: string | null;
  pay_frequency: string | null;
  pay_summary: string | null;
  start_date: string | null;
  status: 'active' | 'archived';
  last_day: string | null;
  cessation_reason: string | null;
  cessation_label: string | null;
}

export interface EmployeeFull extends EmployeeRow {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string | null;
  address_line: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  pay_basis: 'hourly' | 'salary' | null;
  hourly_rate: number | null;
  annual_salary: number | null;
  hours_per_week: number | null;
  tax: {
    tfn_last3: string | null;
    residency: string;
    claim_tax_free_threshold: boolean;
    has_study_training_loans: boolean;
    working_holiday_maker: boolean;
    scale: string | null;
  };
  super: { fund_name: string; usi: string | null; member_number: string | null; rate: number } | null;
  bank: { account_name: string; bsb: string | null; account_number: string } | null;
  super_rate: number;
}

export interface EmployeePayload {
  first_name: string; middle_name: string | null; last_name: string; date_of_birth: string | null;
  email: string | null; mobile: string | null;
  address_line: string | null; suburb: string | null; state: string | null; postcode: string | null;
  job_title: string | null; employment_basis: string; start_date: string;
  pay_frequency: string; pay_basis: 'hourly' | 'salary';
  hourly_rate: number | null; annual_salary: number | null; hours_per_week: number | null;
  tfn: string | null; residency: string;
  claim_tax_free_threshold: boolean; has_study_training_loans: boolean; working_holiday_maker: boolean;
  super_fund_name: string | null; super_usi: string | null; super_member_number: string | null;
  bank_account_name: string | null; bank_bsb: string | null; bank_account_number: string | null;
}
