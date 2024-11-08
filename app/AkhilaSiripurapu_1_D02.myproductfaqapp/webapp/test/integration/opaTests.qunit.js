sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'AkhilaSiripurapu1D02/myproductfaqapp/test/integration/FirstJourney',
		'AkhilaSiripurapu1D02/myproductfaqapp/test/integration/pages/ProductFAQList',
		'AkhilaSiripurapu1D02/myproductfaqapp/test/integration/pages/ProductFAQObjectPage'
    ],
    function(JourneyRunner, opaJourney, ProductFAQList, ProductFAQObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('AkhilaSiripurapu1D02/myproductfaqapp') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheProductFAQList: ProductFAQList,
					onTheProductFAQObjectPage: ProductFAQObjectPage
                }
            },
            opaJourney.run
        );
    }
);