/**
 * External dependencies
 */
import React from 'react';
import { Notice } from '@wordpress/components';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';

const InlineNotice: React.FunctionComponent< Notice.Props > = ( {
	className,
	...restProps
} ) => (
	<Notice
		className={ classNames( 'wcpay-inline-notice', className ) }
		{ ...restProps }
	/>
);

export default InlineNotice;
