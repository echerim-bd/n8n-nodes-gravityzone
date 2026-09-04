import {
	type IExecuteFunctions,
	type IDataObject,
	type INodeExecutionData,
	type INodeProperties,
} from 'n8n-workflow';

import { processJsonInput, updateDisplayOptions, wrapData } from '../../utils/utilities';

import { gravityZoneApiRequest } from '../../transport';

import { companyTypeProperty, showForPartnerNested } from '../../utils/companyType';

const properties: INodeProperties[] = [
	{
		displayName:
			'Documentation: <a href="https://www.bitdefender.com/business/support/en/77209-1300589-createintegration.html" target="_blank" rel="noopener noreferrer">Create Integration</a>',
		name: 'createIntegrationDocsNotice',
		type: 'notice',
		default: '',
	},
	companyTypeProperty,
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'The name of the integration',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		options: [
			{
				name: 'VMware Integration',
				value: 1,
			},
		],
		default: 1,
		description: 'The integration type',
	},
	{
		displayName: 'Specifics (JSON)',
		name: 'specificsJson',
		type: 'json',
		required: true,
		default: '{}',
		description: 'A specifics object',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
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
				description: 'The ID of the company the integration belongs to',
				displayOptions: showForPartnerNested,
			},
		],
	},
];

const displayOptions = {
	show: { category: ['integrations'], action: ['createIntegration'] },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const options = this.getNodeParameter('options', i, {});

	const name = this.getNodeParameter('name', i) as string;
	const type = this.getNodeParameter('type', i) as number;
	const specifics = processJsonInput(this,
		this.getNodeParameter('specificsJson', i),
		'Specifics',
	) as IDataObject;

	const params: IDataObject = { name, type, specifics };

	if (options.companyId) params.companyId = options.companyId;

	const responseData = await gravityZoneApiRequest.call(
		this,
		'integrations',
		'createIntegration',
		params,
	);

	return this.helpers.constructExecutionMetaData(wrapData(responseData), {
		itemData: { item: i },
	});
}
