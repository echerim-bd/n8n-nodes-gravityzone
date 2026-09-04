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
			'Documentation: <a href="https://www.bitdefender.com/business/support/en/77209-140258-createemptyquarantinetask.html" target="_blank" rel="noopener noreferrer">Create Empty Quarantine Task</a>',
		name: 'createEmptyQuarantineTaskDocsNotice',
		type: 'notice',
		default: '',
	},
	companyTypeProperty,
	{
		displayName: 'Service',
		name: 'service',
		type: 'options',
		default: 'computers',
		options: [
			{ name: 'Computers', value: 'computers', description: 'Computers quarantine' },
			{ name: 'Exchange', value: 'exchange', description: 'Exchange quarantine' },
		],
		description: 'Service type for quarantine',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Include Sub Companies',
				name: 'includeSubCompanies',
				type: 'boolean',
				default: false,
				description: 'Whether the quarantined items of child companies are included',
				displayOptions: showForPartnerNested,
			},
		],
	},
];

const displayOptions = {
	show: { category: ['quarantine'], action: ['createEmptyQuarantineTask'] },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const options = this.getNodeParameter('options', i, {});

	const service = this.getNodeParameter('service', i) as string;

	const params: IDataObject = {};

	if (options.includeSubCompanies !== undefined)
		params.includeSubCompanies = options.includeSubCompanies;

	const responseData = await gravityZoneApiRequest.call(
		this,
		`quarantine/${service}`,
		'createEmptyQuarantineTask',
		params,
		'v1.1',
	);

	return this.helpers.constructExecutionMetaData(wrapData(responseData), { itemData: { item: i } });
}
