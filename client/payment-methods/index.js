/** @format */

/**
 * External dependencies
 */
import React, { useContext, useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
	Button,
	Card,
	CardDivider,
	CardHeader,
	DropdownMenu,
	ExternalLink,
} from '@wordpress/components';
import { moreVertical } from '@wordpress/icons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';
import {
	useEnabledPaymentMethodIds,
	useGetAvailablePaymentMethodIds,
	useGetPaymentMethodStatuses,
	useSelectedPaymentMethod,
	useUnselectedPaymentMethod,
} from 'wcpay/data';

import useIsUpeEnabled from '../settings/wcpay-upe-toggle/hook.js';
import WcPayUpeContext from '../settings/wcpay-upe-toggle/context';
import PAYMENT_METHOD_IDS from './constants';

// Survey modal imports.
import WcPaySurveyContextProvider from '../settings/survey-modal/provider';
import SurveyModal from '../settings/survey-modal';
import DisableUPEModal from '../settings/disable-upe-modal';
import PaymentMethodsList from 'components/payment-methods-list';
import PaymentMethod from 'components/payment-methods-list/payment-method';
import WCPaySettingsContext from '../settings/wcpay-settings-context';
import Pill from '../components/pill';
import methodsConfiguration from '../payment-methods-map';
import CardBody from '../settings/card-body';
import { upeCapabilityStatuses } from 'wcpay/additional-methods-setup/constants';
import ConfirmPaymentMethodActivationModal from './activation-modal';
import ConfirmPaymentMethodDeleteModal from './delete-modal';
import { getAdminUrl } from 'wcpay/utils';

const PaymentMethodsDropdownMenu = ( { setOpenModal } ) => {
	return (
		<DropdownMenu
			icon={ moreVertical }
			label={ __( 'Add feedback or disable', 'woocommerce-payments' ) }
			controls={ [
				{
					title: __( 'Provide feedback', 'woocommerce-payments' ),
					onClick: () => setOpenModal( 'survey' ),
				},
				{
					title: 'Disable',
					onClick: () => setOpenModal( 'disable' ),
				},
			] }
		/>
	);
};

const UpeSetupBanner = () => {
	const [ , setIsUpeEnabled ] = useIsUpeEnabled();

	const handleEnableUpeClick = () => {
		setIsUpeEnabled( true ).then( () => {
			window.location.href = getAdminUrl( {
				page: 'wc-admin',
				path: '/payments/additional-payment-methods',
			} );
		} );
	};

	return (
		<>
			<CardDivider />
			<CardBody
				className={ classNames( 'payment-methods__express-checkouts', {
					'background-local-payment-methods': ! wcpaySettings.isBnplAffirmAfterpayEnabled,
				} ) }
			>
				<h3>
					{ __(
						'Boost your sales by accepting additional payment methods',
						'woocommerce-payments'
					) }
				</h3>
				<p>
					{ __(
						/* eslint-disable-next-line max-len */
						'Get access to additional payment methods and an improved checkout experience.',
						'woocommerce-payments'
					) }
				</p>

				<div className="payment-methods__express-checkouts-actions">
					<span className="payment-methods__express-checkouts-get-started">
						<Button isSecondary onClick={ handleEnableUpeClick }>
							{ __(
								'Enable in your store',
								'woocommerce-payments'
							) }
						</Button>
					</span>
					<ExternalLink href="https://woocommerce.com/document/payments/additional-payment-methods/">
						{ __( 'Learn more', 'woocommerce-payments' ) }
					</ExternalLink>
				</div>
			</CardBody>
		</>
	);
};

const PaymentMethods = () => {
	const [ enabledMethodIds ] = useEnabledPaymentMethodIds();

	const paymentMethodStatuses = useGetPaymentMethodStatuses();

	const availablePaymentMethodIds = useGetAvailablePaymentMethodIds();

	// We filter link payment method since this will be displayed in other section (express checkout).
	// We further split the available methods into pay later and non-pay later methods to sort them in the required order later.
	const availableNonPayLaterMethods = availablePaymentMethodIds.filter(
		( id ) =>
			PAYMENT_METHOD_IDS.LINK !== id &&
			PAYMENT_METHOD_IDS.CARD !== id &&
			! methodsConfiguration[ id ].allows_pay_later
	);

	const availablePayLaterMethods = availablePaymentMethodIds.filter(
		( id ) =>
			PAYMENT_METHOD_IDS.LINK !== id &&
			methodsConfiguration[ id ].allows_pay_later
	);

	const orderedAvailablePaymentMethodIds = [
		PAYMENT_METHOD_IDS.CARD,
		...availablePayLaterMethods,
		...availableNonPayLaterMethods,
	];

	const availableMethods = orderedAvailablePaymentMethodIds.map(
		( methodId ) => methodsConfiguration[ methodId ]
	);

	const isCreditCardEnabled = enabledMethodIds.includes( 'card' );

	const [ activationModalParams, handleActivationModalOpen ] = useState(
		null
	);
	const [ deleteModalParams, handleDeleteModalOpen ] = useState( null );

	const [ , updateSelectedPaymentMethod ] = useSelectedPaymentMethod();

	const completeActivation = ( itemId ) => {
		updateSelectedPaymentMethod( itemId );
		handleActivationModalOpen( null );
	};

	const [ , updateUnselectedPaymentMethod ] = useUnselectedPaymentMethod();

	const completeDeleteAction = ( itemId ) => {
		updateUnselectedPaymentMethod( itemId );
		handleDeleteModalOpen( null );
	};

	const getStatusAndRequirements = ( itemId ) => {
		const stripeKey = methodsConfiguration[ itemId ].stripe_key;
		const stripeStatusContainer = paymentMethodStatuses[ stripeKey ] ?? [];
		if ( ! stripeStatusContainer ) {
			return {
				status: upeCapabilityStatuses.UNREQUESTED,
				requirements: [],
			};
		}
		return {
			status: stripeStatusContainer.status,
			requirements: stripeStatusContainer.requirements,
		};
	};

	const handleCheckClick = ( itemId ) => {
		const statusAndRequirements = getStatusAndRequirements( itemId );
		if (
			'unrequested' === statusAndRequirements.status &&
			0 < statusAndRequirements.requirements.length
		) {
			handleActivationModalOpen( {
				id: itemId,
				requirements: statusAndRequirements.requirements,
			} );
		} else {
			completeActivation( itemId );
		}
	};

	const handleUncheckClick = ( itemId ) => {
		const methodConfig = methodsConfiguration[ itemId ];
		const statusAndRequirements = getStatusAndRequirements( itemId );
		if ( methodConfig && 'active' === statusAndRequirements.status ) {
			handleDeleteModalOpen( {
				id: itemId,
				label: methodConfig.label,
				Icon: methodConfig.icon,
			} );
		} else {
			completeDeleteAction( itemId );
		}
	};

	const {
		featureFlags: { upeSettingsPreview: isUpeSettingsPreviewEnabled },
	} = useContext( WCPaySettingsContext );

	const { isUpeEnabled, status, upeType } = useContext( WcPayUpeContext );
	const [ openModalIdentifier, setOpenModalIdentifier ] = useState( '' );

	return (
		<>
			{ 'disable' === openModalIdentifier ? (
				<DisableUPEModal
					setOpenModal={ setOpenModalIdentifier }
					triggerAfterDisable={ () =>
						setOpenModalIdentifier( 'survey' )
					}
				/>
			) : null }
			{ 'survey' === openModalIdentifier ? (
				<WcPaySurveyContextProvider>
					<SurveyModal
						setOpenModal={ setOpenModalIdentifier }
						surveyKey="wcpay-upe-disable-early-access-2022-may"
						surveyQuestion="why-disable"
					/>
				</WcPaySurveyContextProvider>
			) : null }

			<Card
				className={ classNames( 'payment-methods', {
					'is-loading': 'pending' === status,
				} ) }
			>
				{ isUpeEnabled && (
					<CardHeader className="payment-methods__header">
						<h4 className="payment-methods__heading">
							<span>
								{ __(
									'Payment methods',
									'woocommerce-payments'
								) }
							</span>
							{ 'split' !== upeType && (
								<>
									{ ' ' }
									<Pill>
										{ __(
											'Early access',
											'woocommerce-payments'
										) }
									</Pill>
								</>
							) }
						</h4>
						<PaymentMethodsDropdownMenu
							setOpenModal={ setOpenModalIdentifier }
						/>
					</CardHeader>
				) }

				<CardBody size={ null }>
					<PaymentMethodsList className="payment-methods__available-methods">
						{ availableMethods.map(
							( {
								id,
								label,
								description,
								icon: Icon,
								allows_manual_capture: isAllowingManualCapture,
							} ) => (
								<PaymentMethod
									id={ id }
									key={ id }
									label={ label }
									description={ description }
									checked={
										enabledMethodIds.includes( id ) &&
										upeCapabilityStatuses.INACTIVE !==
											getStatusAndRequirements( id )
												.status
									}
									// The card payment method is required when UPE is active, and it can't be disabled/unchecked.
									required={
										PAYMENT_METHOD_IDS.CARD === id &&
										isUpeEnabled
									}
									locked={
										PAYMENT_METHOD_IDS.CARD === id &&
										isCreditCardEnabled &&
										isUpeEnabled
									}
									Icon={ Icon }
									status={
										getStatusAndRequirements( id ).status
									}
									isAllowingManualCapture={
										isAllowingManualCapture
									}
									onUncheckClick={ () => {
										handleUncheckClick( id );
									} }
									onCheckClick={ () => {
										handleCheckClick( id );
									} }
								/>
							)
						) }
					</PaymentMethodsList>
				</CardBody>
				{ isUpeSettingsPreviewEnabled && ! isUpeEnabled && (
					<UpeSetupBanner />
				) }
			</Card>
			{ activationModalParams && (
				<ConfirmPaymentMethodActivationModal
					onClose={ () => {
						handleActivationModalOpen( null );
					} }
					onConfirmClose={ () => {
						completeActivation( activationModalParams.id );
					} }
					requirements={ activationModalParams.requirements }
					paymentMethod={ activationModalParams.id }
				/>
			) }
			{ deleteModalParams && (
				<ConfirmPaymentMethodDeleteModal
					id={ deleteModalParams.id }
					label={ deleteModalParams.label }
					icon={ deleteModalParams.Icon }
					onConfirm={ () => {
						completeDeleteAction( deleteModalParams.id );
					} }
					onCancel={ () => {
						handleDeleteModalOpen( null );
					} }
				/>
			) }
		</>
	);
};

export default PaymentMethods;
