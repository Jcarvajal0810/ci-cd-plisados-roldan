import { WhatsAppMessages, whatsappLink } from './whatsapp-link.builder';

describe('whatsappLink', () => {
  it('builds a wa.me link with the encoded message', () => {
    expect(whatsappLink('573116254705', 'Hola, ¿cómo están?')).toBe(
      'https://wa.me/573116254705?text=Hola%2C%20%C2%BFc%C3%B3mo%20est%C3%A1n%3F',
    );
  });

  it('keeps only digits from the number', () => {
    expect(whatsappLink('+57 311 625 4705', 'x')).toBe('https://wa.me/573116254705?text=x');
  });
});

describe('WhatsAppMessages (contracts/ui-routes.md)', () => {
  it('generic message', () => {
    expect(WhatsAppMessages.generic()).toBe(
      'Hola, Plisados Roldán. Quiero más información sobre sus servicios.',
    );
  });

  it('offering message names the service', () => {
    expect(WhatsAppMessages.offering('Plisado')).toBe(
      'Hola, quiero cotizar el servicio de Plisado.',
    );
  });

  it('success case message names the case', () => {
    expect(WhatsAppMessages.successCase('Pasarela Colombiamoda')).toBe(
      'Hola, vi el caso "Pasarela Colombiamoda" y quiero algo similar.',
    );
  });
});
