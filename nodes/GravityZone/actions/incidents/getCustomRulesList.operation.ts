import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

import { updateDisplayOptions, wrapData } from '../../utils/utilities';

import { gravityZoneApiRequest } from '../../transport';

import { companyTypeProperty, showForPartnerNested } from '../../utils/companyType';

const properties: INodeProperties[] = [
	{
		displayName:
			'Documentation: <a href="https://www.bitdefender.com/business/support/en/77209-135333-getcustomruleslist.html" target="_blank" rel="noopener noreferrer">Get Custom Rules List</a>',
		name: 'getCustomRulesListDocsNotice',
		type: 'notice',
		default: '',
	},
	companyTypeProperty,
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Company ID',
				name: 'companyId',
				type: 'string',
				default: '',
				description:
					'The ID of the company to retrieve the custom rules for. Defaults to the company of the API key.',
				displayOptions: showForPartnerNested,
			},
			{
				displayName: 'Subtypes',
				name: 'subtypes',
				type: 'multiOptions',
				default: [],
				options: [
					{ name: 'Basic', value: 0 },
					{ name: 'YARA', value: 1 },
				],
				description:
					'Detection rules only. Filter by rule subtype; omit to retrieve all detection rules.',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				default: 2,
				options: [
					{ name: 'Detection', value: 1 },
					{ name: 'Exclusion', value: 2 },
				],
				description: 'Specifies the type of custom rules to retrieve',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 1,
				description: 'The results page number',
			},
			{
				displayName: 'Per Page',
				name: 'perPage',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 50,
				description: 'The number of results displayed per page',
			},
		],
	},
];

const displayOptions = {
	show: { category: ['incidents'], action: ['getCustomRulesList'] },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const options = this.getNodeParameter('options', i, {});

	const params: IDataObject = {};

	if (options.type !== undefined) params.type = options.type;
	if (options.page !== undefined) params.page = options.page;
	if (options.perPage !== undefined) params.perPage = options.perPage;

	if (options.companyId) params.companyId = options.companyId;

	if ((options.subtypes as unknown[])?.length) params.subtypes = options.subtypes;

	const responseData = await gravityZoneApiRequest.call(
		this,
		'incidents',
		'getCustomRulesList',
		params,
	);

	return this.helpers.constructExecutionMetaData(wrapData(responseData), {
		itemData: { item: i },
	});
}
