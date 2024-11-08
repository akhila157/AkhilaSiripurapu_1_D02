sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'AkhilaSiripurapu1D02/customermessages/test/integration/FirstJourney',
		'AkhilaSiripurapu1D02/customermessages/test/integration/pages/CustomerMessageList',
		'AkhilaSiripurapu1D02/customermessages/test/integration/pages/CustomerMessageObjectPage'
    ],
    function(JourneyRunner, opaJourney, CustomerMessageList, CustomerMessageObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('AkhilaSiripurapu1D02/customermessages') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheCustomerMessageList: CustomerMessageList,
					onTheCustomerMessageObjectPage: CustomerMessageObjectPage
                }
            },
            opaJourney.run
        );
    }
);