export type FieldType = 'text' | 'email' | 'date' | 'number' | 'currency' | 'choice';

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  value?: string;
  required?: boolean;
  options?: string[];
};

export type Template = {
  id: string;
  html: string;
  text: string;
  fields: Field[];
};

export type FillRequest = {
  templateId: string;
  values: Record<string, string>;
};