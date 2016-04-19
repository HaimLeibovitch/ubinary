var cellxpertUserName = 'naama';
var cellxpertPass = 'naama123';
var cellxpertAffiliateListCommand = 'affiliatelistext';
var cellxpertBaseUrl = 'http://go.binaryoptions.partners/api/admin/?username='+ cellxpertUserName +'&password=' + cellxpertPass + '&command=';

var cellxpertBaseUrl = 'http://go.binaryoptions.partners/api/admin/?username=naama&password=naama123&command=';
exports.getAllAffiliates = function (callback){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
            if(xmlhttp.status == 200){
                var xml = xmlhttp.responseText;
                parseString(xml, function (err, result) {
                    var parsedSubchannels = handleAffiliates(result.ResultSet.Affiliate);
                    callback ('OK', parsedSubchannels);
                });
            }
            else if(xmlhttp.status == 400) {
                console.log('There was an error 400')
            }
            else {
                console.log('something else other than 200 was returned', xmlhttp.status)
            }
        }
    };

    xmlhttp.open("GET", cellxpertBaseUrl + cellxpertAffiliateListCommand, true);
    xmlhttp.send();
};

function handleAffiliates (affiliates) {
    var allSubchannels = [];
    for (var aff in affiliates) {
        var sc = {
            _id: affiliates[aff].AffiliateID[0],
            UserName:affiliates[aff].UserName[0],
            FirstName:affiliates[aff].FirstName[0],
            LastName:affiliates[aff].LastName[0],
            Email:affiliates[aff].Email[0],
            Phone:affiliates[aff].Phone[0],
            Country:affiliates[aff].Country[0],
            AffiliateManager:affiliates[aff].AffiliateManager[0],
            FixedCPA:parseFloat(affiliates[aff].CPA_amount[0])
        };
        allSubchannels.push(sc);
    }
    return allSubchannels;
}
