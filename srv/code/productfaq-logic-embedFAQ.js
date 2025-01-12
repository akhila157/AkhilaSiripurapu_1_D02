const cds = require('@sap/cds');
const LOG = cds.log('GenAI');
const { generateEmbedding } = require('./genai/embedding');
/**
 * 
 * @After(event = { "CREATE","UPDATE" }, entity = "akhilaSiripurapu_1_D02Srv.ProductFAQ")
 * @param {(Object|Object[])} results - For the After phase only: the results of the event processing
 * @param {Object} request - User information, tenant-specific CDS model, headers and query parameters
*/
module.exports = async function(results, request) {
	try {
		// Extract the ProductFAQ ID from the request data
		const productFAQID = request.data.ID;
		if (!productFAQID) {
			return request.reject(400, 'ProductFAQ ID is missing.');
		}
	
		// Fetch the specific ProductFAQ entry for update
		const productFAQ = await SELECT.one('AkhilaSiripurapu_1_D02.ProductFAQ').where({ ID: productFAQID }).forUpdate();
		if (!productFAQ) {
			return request.reject(404, `ProductFAQ with ID ${productFAQID} not found.`);
		}
	
		const {
			ID,
			issue,
			question,
			answer
		} = productFAQ;
	
		// Generate the embedding for the concatenated issue, question, and answer text
		let embedding;
		try {
			embedding = await generateEmbedding(request, `${issue} ${question} ${answer}`)
			LOG.info("embedding", embedding);
		} catch (error) {
			LOG.error('Embedding service failed:', error.message);
			return request.reject(500, 'Embedding service failed.');
		}
	
		// Update the ProductFAQ entry with the generated embedding
		await UPDATE('AkhilaSiripurapu_1_D02.ProductFAQ').set({ embedding: embedding }).where({ ID });
	
		LOG.info(`ProductFAQ with ID ${ID} updated with new embedding.`);
	
	} catch (err) {
		// Log the error and send a response with appropriate details
		LOG.error('An error occurred:', err.message);
	
		const message = err.rootCause?.message || err.message || 'An unexpected error occurred';
		request.reject({
			code: 'INTERNAL_SERVER_ERROR',
			message: message,
			target: 'EmbedFAQs',
			status: err.code || 500,
		});
	}	
}