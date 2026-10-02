import { Subject, throwError } from 'rxjs';
import { BitcoinInvoiceComponent } from './bitcoin-invoice.component';

describe('BitcoinInvoiceComponent invoice replacement', () => {
  for (const status of [400, 404]) {
    it(`clears a previous ${status} payment error when watching a new invoice`, () => {
      const pending = new Subject<any>();
      const api = jasmine.createSpyObj('ServicesApiServices', ['getPaymentStatus$']);
      api.getPaymentStatus$.and.returnValue(throwError(() => ({ status })));
      const component = new BitcoinInvoiceComponent(api, null);
      component.invoice = { btcpayInvoiceId: 'expired', btcDue: 1 };
      component.watchInvoice();
      expect(component.paymentErrorMessage).not.toBe('');
      expect(component.paymentStatus).toBe(-1);

      api.getPaymentStatus$.and.returnValue(pending);
      component.invoice = { btcpayInvoiceId: 'replacement', btcDue: 1 };
      component.watchInvoice();
      expect(component.paymentErrorMessage).toBe('');
      expect(component.paymentStatus).toBe(2);
      expect(api.getPaymentStatus$).toHaveBeenCalledWith('replacement');
      component.ngOnDestroy();
    });
  }

  it('clears a previous payment error when the invoice is removed', () => {
    const api = jasmine.createSpyObj('ServicesApiServices', ['getPaymentStatus$']);
    api.getPaymentStatus$.and.returnValue(throwError(() => ({ status: 400 })));
    const component = new BitcoinInvoiceComponent(api, null);
    component.invoice = { btcpayInvoiceId: 'expired', btcDue: 1 };
    component.watchInvoice();
    expect(component.paymentErrorMessage).not.toBe('');

    component.invoice = null;
    component.watchInvoice();
    expect(component.paymentErrorMessage).toBe('');
    expect(component.paymentStatus).toBe(1);
    component.ngOnDestroy();
  });
});
