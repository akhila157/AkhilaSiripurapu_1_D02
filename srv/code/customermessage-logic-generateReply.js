const cds = require('@sap/cds');
const LOG = cds.log('GenAI');
const { generateResponseTechMessage, generateResponseOtherMessage } = require('./genai/orchestration');
const { generateEmbedding } = require('./genai/embedding');

const SIMILARITY_THRESHOLD = 0.45;
/**
 * 
 * @On(event = { "Action1" }, entity = "akhilaSiripurapu_1_D02Srv.CustomerMessage")
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
	
		const { fullMessageCustomerLanguage, messageCategory, messageSentiment, S4HC_ServiceOrder_ServiceOrder: attachedSOId } = customerMessage;
	
		let resultJSON;
		if (messageCategory === 'Technical') {
			let fullMessageEmbedding;
			try {
				// Generate embedding for the technical message
				fullMessageEmbedding = await generateEmbedding(request, fullMessageCustomerLanguage);
			} catch (err) {
				LOG.error('Embedding service failed', err);
				return request.reject(500, 'Embedding service failed');
			}
	
			// Retrieve relevant FAQ items based on the similarity with the generated embedding
			const relevantFAQs = await SELECT.from('AkhilaSiripurapu_1_D02.ProductFAQ')
				.columns('ID', 'issue', 'question', 'answer')
				.where`cosine_similarity(embedding, to_real_vector(${fullMessageEmbedding})) > ${SIMILARITY_THRESHOLD}`;
			
			const faqItem = (relevantFAQs && relevantFAQs.length > 0) ? relevantFAQs[0] : { issue: '', question: '', answer: '' };
			try {
				// Generate response for the technical message using the FAQ item
				resultJSON = await generateResponseTechMessage(faqItem.issue, faqItem.question, faqItem.answer, fullMessageCustomerLanguage);
			} catch (err) {
				LOG.error('Completion service failed', err);
				return request.reject(500, 'Completion service failed');
			}
		} else {
			try {
				// Generate response for non-technical messages
				resultJSON = await generateResponseOtherMessage(messageSentiment, fullMessageCustomerLanguage);
			} catch (err) {
				LOG.error('Completion service failed', err);
				return request.reject(500, 'Completion service failed');
			}
		}
	
		const { suggestedResponseCustomerLanguage, suggestedResponseEnglish } = resultJSON;
		// Ensure the generated responses are valid before updating the record
		if (!suggestedResponseCustomerLanguage || !suggestedResponseEnglish) {
			return request.reject(500, 'Completion service failed. Generated responses are invalid');
		}
	
		// Update the CustomerMessage with the generated responses
		await UPDATE('AkhilaSiripurapu_1_D02.CustomerMessage').set({
			suggestedResponseCustomerLanguage,
			suggestedResponseEnglish,
		}).where({ ID });
	
		LOG.info(`CustomerMessage with ID ${ID} updated with a reply to the customer.`);
	} catch (err) {
		// Log and handle unexpected errors
		LOG.error('An error occurred:', err.message);
		request.reject({
			code: 'INTERNAL_SERVER_ERROR',
			message: err.message || 'An internal error occurred',
			target: 'GenerateReply',
			status: err.code || 500,
		});
	}
	
}