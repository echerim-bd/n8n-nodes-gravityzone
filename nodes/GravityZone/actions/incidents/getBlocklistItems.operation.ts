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
			'Documentation: <a href="https://www.bitdefender.com/business/support/en/77209-135328-getblocklistitems.html" target="_blank" rel="noopener noreferrer">Get Blocklist Items</a>',
		name: 'getBlocklistItemsDocsNotice',
		type: 'notice',
		default: '',
	},
	companyTypeProperty,
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		required: true,
		typeOptions: {
			minValue: 1,
		},
		default: 1,
		description: 'The number of the results page currently displayed',
	},
	{
		displayName: 'Per Page',
		name: 'perPage',
		type: 'number',
		required: true,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'The number of items displayed per page',
	},
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
					'When set, only the blocklist items belonging to the company with this ID are returned',
				displayOptions: showForPartnerNested,
			},
		],
	},
];

const displayOptions = { show: { category: ['incidents'], action: ['getBlocklistItems'] } };

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const options = this.getNodeParameter('options', i, {});

	const page = this.getNodeParameter('page', i) as number;
	const perPage = this.getNodeParameter('perPage', i) as number;

	const params: IDataObject = { page, perPage };

	if (options.companyId) params.companyId = options.companyId;

	const responseData = await gravityZoneApiRequest.call(
		this,
		'incidents',
		'getBlocklistItems',
		params,
		'v1.2',
	);

	return this.helpers.constructExecutionMetaData(wrapData(responseData), { itemData: { item: i } });
}
