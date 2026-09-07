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
			'Documentation: <a href="https://www.bitdefender.com/business/support/en/77209-140028-getmaintenancewindowlist.html" target="_blank" rel="noopener noreferrer">Get Maintenance Windows List</a>',
		name: 'getMaintenanceWindowsListDocsNotice',
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
				description: 'The ID of the company to retrieve maintenance windows for',
				displayOptions: showForPartnerNested,
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{
						name: 'Patch Management',
						value: 0,
					},
				],
				default: 0,
				description:
					'The type of maintenance windows to retrieve. If not provided, all windows will be retrieved.',
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
				description: 'The number of items displayed in a page',
			},
		],
	},
];

const displayOptions = {
	show: { category: ['maintenance_windows'], action: ['getMaintenanceWindowsList'] },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const options = this.getNodeParameter('options', i, {});

	const params: IDataObject = {};

	if (options.type !== undefined) params.type = options.type;
	if (options.page !== undefined) params.page = options.page;
	if (options.perPage !== undefined) params.perPage = options.perPage;

	if (options.companyId) params.companyId = options.companyId;

	const responseData = await gravityZoneApiRequest.call(
		this,
		'maintenanceWindows',
		'getMaintenanceWindowsList',
		params,
	);

	return this.helpers.constructExecutionMetaData(wrapData(responseData), {
		itemData: { item: i },
	});
}
