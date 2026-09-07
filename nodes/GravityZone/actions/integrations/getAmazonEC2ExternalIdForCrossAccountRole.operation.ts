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
			'Documentation: <a href="https://www.bitdefender.com/business/support/en/77209-135310-getamazonec2externalidforcrossaccountrole.html" target="_blank" rel="noopener noreferrer">Get Amazon EC2 External ID for Cross-Account Role</a>',
		name: 'getAmazonEC2ExternalIdForCrossAccountRoleDocsNotice',
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
					'The ID of the company. Defaults to the company of the user who generated the API key.',
				displayOptions: showForPartnerNested,
			},
		],
	},
];

const displayOptions = {
	show: {
		category: ['integrations'],
		action: ['getAmazonEC2ExternalIdForCrossAccountRole'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const options = this.getNodeParameter('options', i, {});

	const params: IDataObject = {};

	if (options.companyId) params.companyId = options.companyId;

	const responseData = await gravityZoneApiRequest.call(
		this,
		'integrations',
		'getAmazonEC2ExternalIdForCrossAccountRole',
		params,
	);

	return this.helpers.constructExecutionMetaData(wrapData(responseData), {
		itemData: { item: i },
	});
}
