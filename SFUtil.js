/**
 * A utility library provided by http://shoefitr.com/
 */

var SFUtil = {

    _oJsonpRequests: {},

    _iJsonpRequestCount: 0,

    DispatchJsonpResponse: function(oResponse, sEcho) {
        // sEcho contains the request id
        var callback = this._oJsonpRequests[sEcho];
        delete this._oJsonpRequests[sEcho];

        if (callback) {
            callback(oResponse);
        }
    },

    // Note that query string variables 'callback' and 'echo' are appended to sUrl, so your request URL
    // must not contain either of these. Also be sure to append "?sid=" + Math.random() to the URL to avoid
    // cache hits.
    LoadJSONP: function(sUrl, f) {
        // sEcho contains the request id
        var sEcho = this._iJsonpRequestCount++;
        this._oJsonpRequests[sEcho] = f;

        var script = document.createElement('script');
        script.setAttribute('src', sUrl +
            '&callback=SFUtil.DispatchJsonpResponse' +
            '&echo=' + sEcho
        );
        document.body.appendChild(script);
    }
};