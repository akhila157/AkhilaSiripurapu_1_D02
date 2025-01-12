const cds = require('@sap/cds');
const LOG = cds.log('GenAI');
/**
 * 
 * @On(event = { "Action2" }, entity = "akhilaSiripurapu_1_D02Srv.CustomerMessage")
 * @param {Object} request - User information, tenant-specific CDS model, headers and query parameters
*/
module.exports = async function(request) {
	try {
		const { ID } = request.params[0] || {};
		// Check if the ID parameter is provided
		if (!ID) {
			return request.reject(400, 'ID parameter is missing.');
		}
	
		// Retrieve the CustomerMessage record based on the provided ID
		const customerMessage = await SELECT.one.from('AkhilaSiripurapu_1_D02.CustomerMessage').where({ ID });
		if (!customerMessage) {
			throw new Error(`CustomerMessage with ID ${ID} not found.`);
		}
	
		const { titleEnglish, fullMessageEnglish, suggestedResponseEnglish, S4HCP_ServiceOrder_ServiceOrder: attachedSOId } = customerMessage;
	
		// Check if essential customer message fields are provided
		if (!titleEnglish || !fullMessageEnglish) {
			return request.reject(400, 'Customer message data is incomplete');
		}
	
		// Connect to the S4HCP Service Order OData service
		const s4HcpServiceOrderOdata = await cds.connect.to('S4HCP_ServiceOrder_Odata');
		const { A_ServiceOrder, A_ServiceOrderText } = s4HcpServiceOrderOdata.entities;
	
		// Define service order items and initial note to be added to the service order
		const itemDur = {
			ServiceOrderItemDescription: 'Service Order duration',
			Product: 'SRV_01',
			ServiceDuration: 1,
			ServiceDurationUnit: 'HR'
		};
		const itemQty = {
			ServiceOrderItemDescription: 'Service Order quantity',
			Product: 'SRV_02',
			Quantity: 1,
			QuantityUnit: 'EA'
		};
		const persResp = { PersonResponsible: '9980003640' };
		const initNote = {
			Language: 'EN',
			LongTextID: 'S001',
			LongText: fullMessageEnglish
		};
		
		// Create the service order object with relevant details
		const servOrder = {
			ServiceOrderType: 'SVO1',
			ServiceOrderDescription: titleEnglish,
			Language: 'EN',
			ServiceDocumentPriority: '5',
			SalesOrganization: '1710',
			DistributionChannel: '10',
			Division: '00',
			SoldToParty: '17100002',
			to_PersonResponsible: [persResp],
			to_Item: [itemDur, itemQty],
			to_Text: [initNote]
		};
	
		let serviceOrder;
		try {
			// Insert the service order into the S4HCP system
			serviceOrder = await s4HcpServiceOrderOdata.run(INSERT.into(A_ServiceOrder, servOrder));
		} catch (error) {
			LOG.error('Error creating service order:', error.message);
			return request.reject(500, 'Failed to create service order.');
		}
	
		const soId = serviceOrder.ServiceOrder;
		LOG.info(`Created Service Order: ${JSON.stringify(serviceOrder)}`);
	
		try {
			// Update the CustomerMessage record with the created service order ID
			await UPDATE('AkhilaSiripurapu_1_D02.CustomerMessage')
				.set({ S4HC_ServiceOrder_ServiceOrder: soId })
				.where({ ID });
		} catch (error) {
			LOG.error('Error updating customer message with service order ID:', error.message);
			return request.reject(500, 'Failed to update customer message.');
		}
	
		LOG.info(`Updated customer message with Service Order Id: ${soId}`);
	
	} catch (err) {
		// Log and handle unexpected errors
		LOG.error('An unexpected error occurred:', err.message || JSON.stringify(err));
		request.reject({
			code: 'INTERNAL_SERVER_ERROR',
			message: err.message || 'An error occurred',
			target: 'CreateOrUpdateServiceOrder',
			status: err.code || 500,
		});
	}
}