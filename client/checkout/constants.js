export const PAYMENT_METHOD_NAME_CARD = 'woocommerce_payments';
export const PAYMENT_METHOD_NAME_BANCONTACT = 'woocommerce_payments_bancontact';
export const PAYMENT_METHOD_NAME_BECS = 'woocommerce_payments_au_becs_debit';
export const PAYMENT_METHOD_NAME_EPS = 'woocommerce_payments_eps';
export const PAYMENT_METHOD_NAME_GIROPAY = 'woocommerce_payments_giropay';
export const PAYMENT_METHOD_NAME_IDEAL = 'woocommerce_payments_ideal';
export const PAYMENT_METHOD_NAME_P24 = 'woocommerce_payments_p24';
export const PAYMENT_METHOD_NAME_SEPA = 'woocommerce_payments_sepa_debit';
export const PAYMENT_METHOD_NAME_SOFORT = 'woocommerce_payments_sofort';
export const PAYMENT_METHOD_NAME_AFFIRM = 'woocommerce_payments_affirm';
export const PAYMENT_METHOD_NAME_AFTERPAY =
	'woocommerce_payments_afterpay_clearpay';
export const PAYMENT_METHOD_NAME_UPE = 'woocommerce_payments_upe';
export const PAYMENT_METHOD_NAME_PAYMENT_REQUEST =
	'woocommerce_payments_payment_request';
export const PAYMENT_METHOD_NAME_WOOPAY_EXPRESS_CHECKOUT =
	'woocommerce_payments_woopay_express_checkout';
export const WC_STORE_CART = 'wc/store/cart';

export function getPaymentMethodsConstants() {
	return [
		PAYMENT_METHOD_NAME_BANCONTACT,
		PAYMENT_METHOD_NAME_BECS,
		PAYMENT_METHOD_NAME_EPS,
		PAYMENT_METHOD_NAME_GIROPAY,
		PAYMENT_METHOD_NAME_IDEAL,
		PAYMENT_METHOD_NAME_P24,
		PAYMENT_METHOD_NAME_SEPA,
		PAYMENT_METHOD_NAME_SOFORT,
		PAYMENT_METHOD_NAME_AFFIRM,
		PAYMENT_METHOD_NAME_AFTERPAY,
		PAYMENT_METHOD_NAME_CARD,
	];
}
