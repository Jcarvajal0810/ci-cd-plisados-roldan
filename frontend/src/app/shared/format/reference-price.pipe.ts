import { Pipe, PipeTransform } from '@angular/core';

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** Reference price as "Desde $ 120.000 COP"; empty when there is no price (FR-004). */
@Pipe({ name: 'referencePrice' })
export class ReferencePricePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value == null ? '' : `Desde ${COP.format(value)} COP`;
  }
}
