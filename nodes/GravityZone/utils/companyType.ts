import type { IDisplayOptions, INodeProperties } from 'n8n-workflow';

/**
 * Some GravityZone public API parameters are only available to partner-level API
 * keys. The JSON-RPC router evaluates the `@if partner` / `@if customer`
 * condition documented on each method and rejects a parameter that does not
 * apply to the company type of the key making the request.
 *
 * This dropdown mirrors that behaviour so the node only offers the parameters
 * the API will actually accept. It is a display-time control: it changes which
 * fields are shown, it does not add anything to the request.
 */
export const companyTypeProperty: INodeProperties = {
	displayName: 'Company Type',
	name: 'companyType',
	type: 'options',
	default: 'customer',
	options: [
		{
			name: 'Customer',
			value: 'customer',
			description: 'The API key acts on its own company only',
		},
		{
			name: 'Partner',
			value: 'partner',
			description: 'The API key can also target the companies it manages',
		},
	],
	description:
		'The company type of the API key used for the request. Select Partner to reveal the parameters that only partner-level keys are allowed to send.',
};

/** For a partner-only parameter declared at the top level of an operation. */
export const showForPartner: IDisplayOptions = {
	show: { companyType: ['partner'] },
};

/**
 * For a partner-only parameter declared inside an `options` collection. The
 * leading slash resolves `companyType` from the root of the node parameters
 * rather than from inside the collection.
 */
export const showForPartnerNested: IDisplayOptions = {
	show: { '/companyType': ['partner'] },
};

/**
 * Marks a single value of a dropdown that only partner-level API keys may send.
 *
 * `displayOptions` applies to a whole property, so it cannot hide one entry of
 * an `options` / `multiOptions` list. Splitting such a list into a customer and
 * a partner copy would duplicate lists as long as the report types, so the
 * partner-only entries stay in place and carry this note in the dropdown
 * instead.
 */
export const PARTNER_ONLY_VALUE = 'Partner-level API keys only';
