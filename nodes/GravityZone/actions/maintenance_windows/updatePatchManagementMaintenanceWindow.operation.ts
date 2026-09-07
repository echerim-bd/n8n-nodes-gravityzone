import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	type IDataObject,
} from 'n8n-workflow';

import { processJsonInput, updateDisplayOptions, wrapData } from '../../utils/utilities';

import { gravityZoneApiRequest } from '../../transport';

import { companyTypeProperty, showForPartnerNested } from '../../utils/companyType';

const properties: INodeProperties[] = [
	{
		displayName:
			'Documentation: <a href="https://www.bitdefender.com/business/support/en/77209-140030-updatepatchmanagementmaintenancewindow.html" target="_blank" rel="noopener noreferrer">Update Patch Management Maintenance Window</a>',
		name: 'updatePatchManagementMaintenanceWindowDocsNotice',
		type: 'notice',
		default: '',
	},
	companyTypeProperty,
	{
		displayName: 'ID',
		name: 'id',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the maintenance window to be updated',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'The name of the maintenance window',
	},
	{
		displayName: 'Allow Change by Other Users',
		name: 'allowChangeByOtherUsers',
		type: 'boolean',
		required: true,
		default: false,
		description: 'Whether users other than the owner can modify this maintenance window',
	},
	{
		displayName: 'Settings (JSON)',
		name: 'settings',
		type: 'json',
		required: true,
		default: '{}',
		description: 'A settings object',
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
				description:
					'The ID of the company. Defaults to the company of the user who generated the API key.',
				displayOptions: showForPartnerNested,
			},
		],
	},
];

const displayOptions = {
	show: {
		category: ['maintenance_windows'],
		action: ['updatePatchManagementMaintenanceWindow'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const id = this.getNodeParameter('id', i) as string;
	const name = this.getNodeParameter('name', i) as string;
	const allowChangeByOtherUsers = this.getNodeParameter('allowChangeByOtherUsers', i) as boolean;
	const settings = processJsonInput(this,
		this.getNodeParameter('settings', i),
		'Settings',
	) as IDataObject;
	const options = this.getNodeParameter('options', i, {});

	const params: IDataObject = {
		id,
		name,
		allowChangeByOtherUsers,
		settings,
	};

	if (options.companyId) params.companyId = options.companyId;

	const responseData = await gravityZoneApiRequest.call(
		this,
		'maintenanceWindows',
		'updatePatchManagementMaintenanceWindow',
		params,
	);

	return this.helpers.constructExecutionMetaData(wrapData(responseData), {
		itemData: { item: i },
	});
}
