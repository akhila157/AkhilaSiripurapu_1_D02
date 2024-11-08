using { S4HCP_ServiceOrder_Odata } from './external/S4HCP_ServiceOrder_Odata.cds';

using { AkhilaSiripurapu_1_D02 as my } from '../db/schema.cds';

@path : '/service/akhilaSiripurapu_1_D02'
service akhilaSiripurapu_1_D02Srv
{
    @odata.draft.enabled
    entity CustomerMessage as
        projection on my.CustomerMessage
        actions
        {
            @cds.odata.bindingparameter.name : '_it'
            @Common.SideEffects : 
            {
                TargetProperties :
                [
                    '_it/suggestedResponseEnglish',
                    '_it/suggestedResponseCustomerLanguage'
                ]
            }
            action Action1
            (
            );
            @(
            cds.odata.bindingparameter.name: '_it',
            Common.SideEffects: {TargetProperties: [
            '_it/suggestedResponseEnglish',
            '_it/suggestedResponseCustomerLanguage'
            ]}
            )
            action Action2
            (
            );
        };

    entity A_ServiceOrder as
        projection on S4HCP_ServiceOrder_Odata.A_ServiceOrder
        {
            ServiceOrder,
            ServiceOrderDescription
        };

    @odata.draft.enabled
    entity ProductFAQ as
        projection on my.ProductFAQ
        {
            ID,
            issue,
            question,
            answer
        };
}

annotate akhilaSiripurapu_1_D02Srv with @requires :
[
    'authenticated-user'
];
