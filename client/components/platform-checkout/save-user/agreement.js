/* eslint-disable max-len */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import interpolateComponents from 'interpolate-components';

const Agreement = () => {
	return (
		<div className="tos">
			{ interpolateComponents( {
				mixedString: __(
					'By entering your phone number and completing your purchase, you will create a Platform Checkout account and agree to {{termsOfService/}} and {{privacyPolicy/}}.',
					'woocommerce-payments'
				),
				components: {
					termsOfService: (
						<a
							href="https://wordpress.com/tos/"
							target="_blank"
							rel="noreferrer"
						>
							{ __( 'Terms of Service', 'woocommerce-payments' ) }
						</a>
					),
					privacyPolicy: (
						<a
							href="https://automattic.com/privacy/"
							target="_blank"
							rel="noreferrer"
						>
							{ __( 'Privacy Policy', 'woocommerce-payments' ) }
						</a>
					),
				},
			} ) }
		</div>
	);
};

export default Agreement;
