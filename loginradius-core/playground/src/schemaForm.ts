import { escapeHtml } from './dom';

export interface SchemaField {
  name?: string;
  display?: string;
  type?: string;
  rules?: string;
  Checked?: boolean;
  options?: Array<{ value?: string; text?: string } | string>;
}

const IDENTIFIER_FIELD_NAMES = new Set([
  'emailid',
  'email',
  'loginid',
  'username',
]);

export const extractFields = (schema: unknown): SchemaField[] => {
  if (Array.isArray(schema)) return schema as SchemaField[];
  if (!schema || typeof schema !== 'object') return [];
  const obj = schema as Record<string, unknown>;
  if (Array.isArray(obj.Inputs)) return obj.Inputs as SchemaField[];
  if (Array.isArray(obj.fields)) return obj.fields as SchemaField[];
  if (Array.isArray(obj.LoginFormSchema))
    return obj.LoginFormSchema as SchemaField[];
  return [];
};

export const isRenderableField = (field: SchemaField): boolean => {
  if (!field || field.type === 'hidden') return false;
  if (field.Checked === false) return false;
  return true;
};

export const isIdentifierField = (field: SchemaField): boolean => {
  const name = (field.name || '').toLowerCase();
  if (IDENTIFIER_FIELD_NAMES.has(name)) return true;
  return name.includes('email');
};

export const renderField = (field: SchemaField): string => {
  const name = escapeHtml(field.name || '');
  const display = escapeHtml(field.display || field.name || '');
  const type = (field.type || 'string').toLowerCase();
  const required = (field.rules || '').includes('required');
  const requiredMark = required ? ' *' : '';
  const requiredAttr = required ? 'required' : '';

  switch (type) {
    case 'password':
      return `
        <div class="input-group">
          <input type="password" name="${name}" placeholder=" " ${requiredAttr} />
          <label>${display}${requiredMark}</label>
          <div class="error-message"></div>
        </div>`;

    case 'email':
    case 'string': {
      const inputType = (field.name || '').toLowerCase().includes('email')
        ? 'email'
        : 'text';
      return `
        <div class="input-group">
          <input type="${inputType}" name="${name}" placeholder=" " ${requiredAttr} />
          <label>${display}${requiredMark}</label>
          <div class="error-message"></div>
        </div>`;
    }

    case 'multi':
    case 'checkbox':
      return `
        <div class="checkbox-group">
          <input type="checkbox" name="${name}" id="field-${name}" ${requiredAttr} />
          <label for="field-${name}">${display}</label>
        </div>`;

    case 'option': {
      const options = field.options ?? [];
      const optionsHtml = options
        .map((opt) => {
          if (typeof opt === 'string') {
            const v = escapeHtml(opt);
            return `<option value="${v}">${v}</option>`;
          }
          const v = escapeHtml(opt.value ?? opt.text ?? '');
          const t = escapeHtml(opt.text ?? opt.value ?? '');
          return `<option value="${v}">${t}</option>`;
        })
        .join('');
      return `
        <div class="input-group">
          <select name="${name}" ${requiredAttr}>
            <option value="">${display}</option>
            ${optionsHtml}
          </select>
          <div class="error-message"></div>
        </div>`;
    }

    default:
      return `
        <div class="input-group">
          <input type="text" name="${name}" placeholder=" " ${requiredAttr} />
          <label>${display}${requiredMark}</label>
          <div class="error-message"></div>
        </div>`;
  }
};

export const renderFields = (fields: SchemaField[]): string =>
  fields.map(renderField).join('');
