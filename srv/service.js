/**
 * Code is auto-generated by Application Logic, DO NOT EDIT.
 * @version(2.0)
 */
const LCAPApplicationService = require('@sap/low-code-event-handler');
const customermessage_Logic_PreprocessMessages = require('./code/customermessage-logic-preprocessMessages');
const productfaq_Logic_EmbedFAQ = require('./code/productfaq-logic-embedFAQ');
const customermessage_Logic_GenerateReply = require('./code/customermessage-logic-generateReply');
const customermessage_Logic_MaintainSO = require('./code/customermessage-logic-maintainSO');

class akhilaSiripurapu_1_D02Srv extends LCAPApplicationService {
    async init() {

        this.before('READ', 'CustomerMessage', async (request) => {
            await customermessage_Logic_PreprocessMessages(request);
        });

        this.after(['CREATE', 'UPDATE'], 'ProductFAQ', async (results, request) => {
            await productfaq_Logic_EmbedFAQ(results, request);
        });

        this.on('Action1', 'CustomerMessage', async (request, next) => {
            return customermessage_Logic_GenerateReply(request);
        });

        this.on('Action2', 'CustomerMessage', async (request, next) => {
            return customermessage_Logic_MaintainSO(request);
        });

        return super.init();
    }
}


module.exports = {
    akhilaSiripurapu_1_D02Srv
};