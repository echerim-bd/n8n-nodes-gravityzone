import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

import { processJsonInput, updateDisplayOptions, wrapData } from '../../utils/utilities';

import { gravityZoneApiRequest } from '../../transport';

import { companyTypeProperty, showForPartnerNested } from '../../utils/companyType';

const properties: INodeProperties[] = [
	{
		displayName:
			'Documentation: <a href="https://www.bitdefender.com/business/support/en/77209-135327-addtoblocklist.html" target="_blank" rel="noopener noreferrer">Add to Blocklist</a>',
		name: 'addToBlocklistDocsNotice',
		type: 'notice',
		default: '',
	},
	companyTypeProperty,
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		default: 'hash',
		options: [
			{ name: 'Hash', value: 'hash' },
			{ name: 'Path', value: 'path' },
			{ name: 'Connection', value: 'connection' },
		],
		description: 'The type of the blocklist rules to create',
	},
	{
		displayName: 'Rules (JSON)',
		name: 'rules',
		type: 'json',
		required: true,
		default: '[]',
		description: 'An array of rule objects',
		typeOptions: { alwaysOpenEditWindow: true },
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
				description: 'The ID of the company the blocklist items belong to',
				displayOptions: showForPartnerNested,
			},
			{
				displayName: 'Recursive',
				name: 'recursive',
				type: 'boolean',
				default: true,
				description:
					'Whether the rules will be applied recursively to all companies managed by the company given in Company ID. When false, the rules are applied only to that company.',
				displayOptions: showForPartnerNested,
			},
		],
	},
];

const displayOptions = { show: { category: ['incidents'], action: ['addToBlocklist'] } };

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const type = this.getNodeParameter('type', i) as string;
	const rules = processJsonInput(this, this.getNodeParameter('rules', i), 'Rules');
	const options = this.getNodeParameter('options', i, {});

	const params: IDataObject = { type, rules: rules as IDataObject[] };

	if (options.recursive !== undefined) params.recursive = options.recursive;

	if (options.companyId) params.companyId = options.companyId;

	const responseData = await gravityZoneApiRequest.call(
		this,
		'incidents',
		'addToBlocklist',
		params,
		'v1.2',
	);

	return this.helpers.constructExecutionMetaData(wrapData(responseData), { itemData: { item: i } });
}
