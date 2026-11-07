import { ConfirmService } from '../../shared/ui/confirm.service';

/**
 * Publishing an item without photos is allowed but asks first (spec edge case). Resolves `true`
 * when publication may go ahead.
 */
export async function confirmPublication(
  confirm: ConfirmService,
  name: string,
  publishing: boolean,
  photoCount: number | undefined,
): Promise<boolean> {
  if (!publishing || photoCount === undefined || photoCount > 0) {
    return true;
  }
  return confirm.ask(`"${name}" no tiene fotos. ¿Publicarlo de todos modos?`, 'Publicar');
}
