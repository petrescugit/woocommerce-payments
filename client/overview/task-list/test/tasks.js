/** @format */

/**
 * Internal dependencies
 */
import { getTasks, taskSort } from '../tasks';

const mockActiveDisputes = [
	{
		wcpay_disputes_cache_id: 4,
		stripe_account_id: 'acct_test',
		dispute_id: 'dp_1',
		charge_id: 'ch_mock',
		amount: 1000,
		currency: 'usd',
		reason: 'fraudulent',
		source: 'visa',
		order_number: 1,
		customer_name: 'Mock customer',
		customer_email: 'mock@customer.net',
		customer_country: 'US',
		status: 'needs_response',
		created: '2019-11-01 23:59:59',
		due_by: '2023-02-01 23:59:59',
		order: {
			number: '1',
			customer_url: 'https://shop.local',
			url: 'http://test.local/order/1',
		},
	},
	{
		wcpay_disputes_cache_id: 4,
		stripe_account_id: 'acct_test',
		dispute_id: 'dp_2',
		charge_id: 'ch_mock',
		amount: 1000,
		currency: 'usd',
		reason: 'fraudulent',
		source: 'visa',
		order_number: 2,
		customer_name: 'Mock customer',
		customer_email: 'mock@customer.net',
		customer_country: 'US',
		status: 'needs_response',
		created: '2019-11-01 23:59:59',
		due_by: '2023-02-03 23:59:59',
		order: {
			number: '1',
			customer_url: 'https://shop.local',
			url: 'http://test.local/order/1',
		},
	},
	{
		wcpay_disputes_cache_id: 4,
		stripe_account_id: 'acct_test',
		dispute_id: 'dp_3',
		charge_id: 'ch_mock',
		amount: 1000,
		currency: 'eur',
		reason: 'fraudulent',
		source: 'visa',
		order_number: 2,
		customer_name: 'Mock customer',
		customer_email: 'mock@customer.net',
		customer_country: 'US',
		status: 'needs_response',
		created: '2019-11-01 23:59:59',
		due_by: '2023-02-07 23:59:59',
		order: {
			number: '1',
			customer_url: 'https://shop.local',
			url: 'http://test.local/order/1',
		},
	},
	{
		wcpay_disputes_cache_id: 1234,
		stripe_account_id: 'acct_test',
		dispute_id: 'dp_1',
		charge_id: 'ch_mock',
		amount: 1000,
		currency: 'usd',
		reason: 'fraudulent',
		source: 'visa',
		order_number: 1,
		customer_name: 'Mock customer',
		customer_email: 'mock@customer.net',
		customer_country: 'US',
		status: 'needs_response',
		created: '2019-11-01 23:59:59',
		due_by: '', // Adding this to cover an edge case where due_by is an empty string. This should be ignored by the task list.
		order: {
			number: '1',
			customer_url: 'https://shop.local',
			url: 'http://test.local/order/1',
		},
	},
];

describe( 'getTasks()', () => {
	beforeEach( () => {
		// mock Date.now that moment library uses to get current date for testing purposes
		Date.now = jest.fn( () => new Date( '2023-02-01T08:00:00.000Z' ) );

		global.wcpaySettings = {
			zeroDecimalCurrencies: [],
			connect: {
				country: 'US',
			},
			currentUserEmail: 'mock@example.com',
			currencyData: {
				US: {
					code: 'USD',
					symbol: '$',
					symbolPosition: 'left',
					thousandSeparator: ',',
					decimalSeparator: '.',
					precision: 2,
				},
			},
		};
	} );
	afterEach( () => {
		// roll it back
		Date.now = () => new Date();
	} );
	it( 'should include business details when flag is set', () => {
		const actual = getTasks( {
			accountStatus: {
				status: 'restricted_soon',
				currentDeadline: 1620857083,
				pastDue: false,
				accountLink: 'http://example.com',
				progressiveOnboarding: {
					isEnabled: false,
				},
			},
			showUpdateDetailsTask: true,
			isAccountOverviewTasksEnabled: true,
		} );

		expect( actual ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					key: 'update-business-details',
					completed: false,
				} ),
			] )
		);
	} );

	it( 'should omit business details when flag is not set', () => {
		const actual = getTasks( {
			accountStatus: {
				status: 'restricted',
				currentDeadline: 1620857083,
				pastDue: true,
				accountLink: 'http://example.com',
				progressiveOnboarding: {
					isEnabled: false,
				},
			},
			showUpdateDetailsTask: false,
			isAccountOverviewTasksEnabled: true,
		} );

		expect( actual ).toEqual(
			expect.not.arrayContaining( [
				expect.objectContaining( {
					key: 'update-business-details',
				} ),
			] )
		);
	} );

	it( 'handles when account is complete', () => {
		const actual = getTasks( {
			accountStatus: {
				status: 'complete',
				currentDeadline: 0,
				pastDue: false,
				accountLink: 'http://example.com',
				progressiveOnboarding: {
					isEnabled: false,
				},
			},
			showUpdateDetailsTask: true,
			isAccountOverviewTasksEnabled: true,
		} );

		expect( actual ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					key: 'update-business-details',
					completed: true,
				} ),
			] )
		);
	} );

	it( 'adds WPCOM user reconnect task when the url is specified', () => {
		const actual = getTasks( {
			accountStatus: {
				status: 'complete',
				progressiveOnboarding: {
					isEnabled: false,
				},
			},
			wpcomReconnectUrl: 'http://example.com',
			isAccountOverviewTasksEnabled: true,
		} );

		expect( actual ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					key: 'reconnect-wpcom-user',
					completed: false,
				} ),
			] )
		);
	} );

	it( 'should omit the WPCOM user reconnect task when the url is not specified', () => {
		const actual = getTasks( {
			accountStatus: {
				status: 'complete',
				progressiveOnboarding: {
					isEnabled: false,
				},
			},
			wpcomReconnectUrl: null,
			isAccountOverviewTasksEnabled: true,
		} );

		expect( actual ).toEqual(
			expect.not.arrayContaining( [
				expect.objectContaining( {
					key: 'reconnect-wpcom-user',
				} ),
			] )
		);
	} );

	it( 'returns the expected keys when the account overview flag is enabled', () => {
		const tasks = getTasks( {
			isAccountOverviewTasksEnabled: true,
			showUpdateDetailsTask: true,
			wpcomReconnectUrl: 'http://example.com',
			accountStatus: {
				progressiveOnboarding: {
					isEnabled: false,
				},
			},
		} );

		expect( tasks ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( { key: 'update-business-details' } ),
				expect.objectContaining( { key: 'reconnect-wpcom-user' } ),
			] )
		);
	} );

	it( 'returns the expected keys when the account is not onboarded', () => {
		const tasks = getTasks( {
			isAccountOverviewTasksEnabled: true,
			showUpdateDetailsTask: true,
			wpcomReconnectUrl: 'http://example.com',
			accountStatus: {
				error: true,
			},
		} );

		expect( tasks ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( { key: 'reconnect-wpcom-user' } ),
			] )
		);
	} );

	it( 'returns the expected keys when the account overview flag is disabled', () => {
		const tasks = getTasks( {
			showUpdateDetailsTask: true,
			wpcomReconnectUrl: 'http://example.com',
			accountStatus: {
				progressiveOnboarding: {
					isEnabled: false,
				},
			},
		} );

		expect( tasks ).toEqual(
			expect.not.arrayContaining( [
				expect.objectContaining( { key: 'update-business-details' } ),
				expect.objectContaining( { key: 'reconnect-wpcom-user' } ),
			] )
		);
	} );

	it( 'should not include the dispute resolution task if no active disputes', () => {
		const activeDisputes = [];
		const actual = getTasks( {
			accountStatus: {
				status: 'restricted_soon',
				currentDeadline: 1620857083,
				pastDue: false,
				accountLink: 'http://example.com',
				progressiveOnboarding: {
					isEnabled: false,
				},
			},
			activeDisputes,
		} );

		expect( actual ).toEqual( [] );
	} );

	it( 'should not include the dispute resolution task if dispute due_by > 7 days', () => {
		// Set Date.now to - 7 days to reduce urgency of disputes.
		Date.now = jest.fn( () => new Date( '2023-01-25T08:00:00.000Z' ) );
		const actual = getTasks( {
			accountStatus: {
				status: 'restricted_soon',
				currentDeadline: 1620857083,
				pastDue: false,
				accountLink: 'http://example.com',
				progressiveOnboarding: {
					isEnabled: false,
				},
			},
			activeDisputes: mockActiveDisputes,
		} );

		expect( actual ).toEqual( [] );
	} );

	it( 'should include the dispute resolution task with 1 urgent dispute', () => {
		const actual = getTasks( {
			accountStatus: {
				status: 'restricted_soon',
				currentDeadline: 1620857083,
				pastDue: false,
				accountLink: 'http://example.com',
				progressiveOnboarding: {
					isEnabled: false,
				},
			},
			activeDisputes: [ mockActiveDisputes[ 0 ] ],
		} );

		expect( actual ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					key: 'dispute-resolution-task-dp_1',
					completed: false,
					level: 1,
					title: 'Respond to a dispute for $10.00 – Last day',
					content: 'Respond today by 11:59 PM',
					actionLabel: 'Respond now',
				} ),
			] )
		);
	} );

	it( 'should include the dispute resolution task', () => {
		// Set Date.now to - 5 days to reduce urgency of dispute.
		Date.now = jest.fn( () => new Date( '2023-01-27T08:00:00.000Z' ) );
		const actual = getTasks( {
			accountStatus: {
				status: 'restricted_soon',
				currentDeadline: 1620857083,
				pastDue: false,
				accountLink: 'http://example.com',
				progressiveOnboarding: {
					isEnabled: false,
				},
			},
			activeDisputes: [ mockActiveDisputes[ 0 ] ],
		} );

		expect( actual ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					key: 'dispute-resolution-task-dp_1',
					completed: false,
					level: 1,
					title: 'Respond to a dispute for $10.00',
					content: 'By Feb 1, 2023 – 6 days left to respond',
					actionLabel: 'Respond now',
				} ),
			] )
		);
	} );

	it( 'should include the dispute resolution task with multiple disputes and 1 urgent dispute', () => {
		const actual = getTasks( {
			accountStatus: {
				status: 'restricted_soon',
				currentDeadline: 1620857083,
				pastDue: false,
				accountLink: 'http://example.com',
				progressiveOnboarding: {
					isEnabled: false,
				},
			},
			activeDisputes: mockActiveDisputes,
		} );

		expect( actual ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					key: 'dispute-resolution-task-dp_1-dp_2-dp_3',
					completed: false,
					level: 1,
					title:
						'Respond to 3 active disputes for a total of $20.00, €10.00',
					content: 'Final day to respond for 1 of the disputes',
					actionLabel: 'See disputes',
				} ),
			] )
		);
	} );

	it( 'should include the dispute resolution task with multiple disputes', () => {
		// Set Date.now to - 5 days to reduce urgency of disputes.
		Date.now = jest.fn( () => new Date( '2023-01-27T08:00:00.000Z' ) );
		const actual = getTasks( {
			accountStatus: {
				status: 'restricted_soon',
				currentDeadline: 1620857083,
				pastDue: false,
				accountLink: 'http://example.com',
				progressiveOnboarding: {
					isEnabled: false,
				},
			},
			activeDisputes: mockActiveDisputes,
		} );

		expect( actual ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					key: 'dispute-resolution-task-dp_1-dp_2-dp_3',
					completed: false,
					level: 1,
					title:
						'Respond to 3 active disputes for a total of $20.00, €10.00',
					content: 'Last week to respond for 1 of the disputes',
					actionLabel: 'See disputes',
				} ),
			] )
		);
	} );

	it( 'should include the po task', () => {
		global.wcpaySettings = {
			accountStatus: {
				status: 'restricted_soon',
				progressiveOnboarding: {
					isEnabled: true,
					isComplete: false,
					tpv: 10000,
					firstTransactionDate: '2023-02-02',
				},
				created: '2022-01-31',
			},
		};
		const actual = getTasks( {
			accountStatus: {
				status: 'restricted_soon',
				currentDeadline: 1620857083,
				pastDue: false,
				accountLink: 'http://example.com',
				progressiveOnboarding: {
					isEnabled: true,
				},
			},
		} );

		expect( actual ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					key: 'verify-bank-details-po',
					completed: false,
					level: 3,
					title:
						'Verify your bank account to start receiving deposits',
				} ),
			] )
		);
	} );
} );

describe( 'taskSort()', () => {
	beforeEach( () => {
		// mock Date.now that moment library uses to get current date for testing purposes
		Date.now = jest.fn( () => new Date( '2023-02-01T12:33:37.000Z' ) );

		global.wcpaySettings = {
			zeroDecimalCurrencies: [],
			connect: {
				country: 'US',
			},
			currentUserEmail: 'mock@example.com',
			currencyData: {
				US: {
					code: 'USD',
					symbol: '$',
					symbolPosition: 'left',
					thousandSeparator: ',',
					decimalSeparator: '.',
					precision: 2,
				},
			},
		};
	} );
	afterEach( () => {
		// roll it back
		Date.now = () => new Date();
	} );
	it( 'should sort the tasks without po', () => {
		const unsortedTasks = getTasks( {
			accountStatus: {
				status: 'restricted_soon',
				currentDeadline: 1620857083,
				pastDue: false,
				accountLink: 'http://example.com',
				progressiveOnboarding: {
					isEnabled: false,
				},
			},
			isAccountOverviewTasksEnabled: true,
			activeDisputes: mockActiveDisputes,
		} );
		unsortedTasks.unshift( {
			key: 'test-element',
			completed: true,
			level: 3,
		} );
		expect( unsortedTasks[ 0 ] ).toEqual(
			expect.objectContaining( {
				key: 'test-element',
				completed: true,
				level: 3,
			} )
		);
		const sortedTasks = unsortedTasks.sort( taskSort );
		expect( sortedTasks[ 0 ] ).toEqual(
			expect.objectContaining( {
				key: 'dispute-resolution-task-dp_1-dp_2-dp_3',
				completed: false,
				level: 1,
			} )
		);
	} );
	it( 'should sort the tasks with po', () => {
		global.wcpaySettings = {
			accountStatus: {
				status: 'restricted_soon',
				progressiveOnboarding: {
					isEnabled: true,
					isComplete: false,
					tpv: 10000,
					firstTransactionDate: '2023-02-02',
				},
				created: '2022-01-31',
			},
		};
		const unsortedTasks = getTasks( {
			accountStatus: {
				status: 'restricted_soon',
				currentDeadline: 1620857083,
				pastDue: false,
				accountLink: 'http://example.com',
				progressiveOnboarding: {
					isEnabled: true,
				},
			},
			isAccountOverviewTasksEnabled: true,
		} );
		unsortedTasks.unshift( {
			key: 'test-element',
			completed: true,
			level: 3,
		} );
		expect( unsortedTasks[ 0 ] ).toEqual(
			expect.objectContaining( {
				key: 'test-element',
				completed: true,
				level: 3,
			} )
		);
		const sortedTasks = unsortedTasks.sort( taskSort );
		expect( sortedTasks[ 0 ] ).toEqual(
			expect.objectContaining( {
				key: 'verify-bank-details-po',
				completed: false,
				level: 3,
				title: 'Verify your bank account to start receiving deposits',
			} )
		);
	} );
} );
