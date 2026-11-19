/** Upload rules shared by galleries and single photos (FR-018). */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.join(',');

/** The Spanish problem with a chosen file, or '' when it can be uploaded. */
export function imageFileProblem(file: File): string {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Formato no soportado';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'El archivo supera 10 MB';
  }
  return '';
}
