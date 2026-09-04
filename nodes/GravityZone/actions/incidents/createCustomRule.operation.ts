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
			'Documentation: <a href="https://www.bitdefender.com/business/support/en/77209-135332-createcustomrule.html" target="_blank" rel="noopener noreferrer">Create Custom Rule</a>',
		name: 'createCustomRuleDocsNotice',
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
		description: 'The name of the rule',
	},
	{
		displayName: 'Rule Settings (JSON)',
		name: 'settings',
		type: 'json',
		required: true,
		default: '{}',
		description: 'A rule settings object',
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
				description:
					'The ID of the company the custom rule will belong to. Defaults to the company of the API key used for the request.',
				displayOptions: showForPartnerNested,
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
				description: 'The type of the rule',
			},
			{
				displayName: 'Subtype',
				name: 'subtype',
				type: 'options',
				default: 0,
				options: [
					{ name: 'Basic', value: 0 },
					{ name: 'YARA', value: 1 },
				],
				description:
					'The kind of detection rule to create. Detection rules only - must be Basic when Type is Exclusion. Basic expects "criteriaList" in Rule Settings, YARA expects "yaraQuery" instead.',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'The description of the rule',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'A comma-separated list of tags (e.g. "tag1, tag2, tag3")',
			},
			{
				displayName: 'Return Rule ID',
				name: 'returnRuleId',
				type: 'boolean',
				default: false,
				description: 'Whether the response will return the ID of the new rule instead of a boolean',
			},
			{
				displayName: 'Targets (JSON)',
				name: 'targets',
				type: 'json',
				default: '{}',
				description:
					'A targets object that scopes the rule to specific companies or endpoint tags. Use "companiesIds" (an array of company IDs, accepted only for partner-level API keys) or "endpointTags" (an array of tagId / companyId objects) - specify only one of the two. If omitted, the rule applies to all endpoints in your company.',
				typeOptions: { alwaysOpenEditWindow: true },
			},
		],
	},
];

const displayOptions = {
	show: { category: ['incidents'], action: ['createCustomRule'] },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', i) as string;
	const settings = processJsonInput(this,
		this.getNodeParameter('settings', i),
		'Rule Settings',
	) as IDataObject;
	const options = this.getNodeParameter('options', i, {});

	const params: IDataObject = { name, settings };

	if (options.companyId !== undefined && (options.companyId as string) !== '')
		params.companyId = options.companyId;
	if (options.type !== undefined) params.type = options.type;
	if (options.subtype !== undefined) params.subtype = options.subtype;
	if (options.description !== undefined && options.description !== '')
		params.description = options.description;
	if (options.tags !== undefined && (options.tags as string) !== '') {
		const tagsStr = options.tags as string;
		params.tags = tagsStr
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);
	}
	if (options.targets !== undefined) {
		const targets = processJsonInput(this, options.targets, 'Targets') as IDataObject;
		if (Object.keys(targets).length > 0) params.targets = targets;
	}
	if (options.returnRuleId !== undefined) params.returnRuleId = options.returnRuleId;

	const responseData = await gravityZoneApiRequest.call(
		this,
		'incidents',
		'createCustomRule',
		params,
	);

	return this.helpers.constructExecutionMetaData(wrapData(responseData), {
		itemData: { item: i },
	});
}
