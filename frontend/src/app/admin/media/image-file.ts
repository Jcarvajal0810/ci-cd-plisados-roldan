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

/**
 * The file chosen in an `<input type="file">` change event, or `null` when nothing was chosen or
 * the file cannot be uploaded. Reports the problem (or clears it) through `report`.
 */
export function chosenImageFile(
  event: Event,
  report: (problem: string) => void,
): { input: HTMLInputElement; file: File } | null {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    return null;
  }
  const problem = imageFileProblem(file);
  report(problem);
  return problem ? null : { input, file };
}
