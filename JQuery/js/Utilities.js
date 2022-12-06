
SHORT_DATE_FORMAT = 'MM/DD/YYYY';
LONG_DATE_FORMAT_TIME = 'MM/DD/YYYY 00:00:00';
LONG_DATETIME_FORMAT = 'MM/DD/YYYY HH:mm:SS';
LONG_DATETIME_FORMAT_DASHBOARD = 'YYYY/MM/DD HH:mm:SS';
LONG_DATETIME_FORMAT_AMPM = 'DD/MMM/YYYY hh:mm:ss A';
LONG_DATETIME_GRID_FORMAT = 'dd/MMM/yyyy hh:mm:ss tt';
LONG_DATETIME_YEAR_FIRST = 'YYYY/MM/DD';
LONG_DATETIME_YEAR_FIRST_TIME = 'yyyy/MM/dd hh:mm:ss tt';
SHORT_DATE_FORMAT_M = 'yyyy/MM/dd';
LONG_DATE_FORMAT = 'DD/MMM/YYYY';

function toASP(value, isLocal, dateFormat) {

    if (isLocal) {
        if (dateFormat != null && dateFormat != 'undefined')
            return '/Date(' + moment(value, LONG_DATETIME_FORMAT).valueOf() + moment(value, LONG_DATETIME_FORMAT).format('ZZ') + ')\/';
        else
            return '/Date(' + moment(value).valueOf() + moment(value).format('ZZ') + ')\/';
    }
    else {
        if (dateFormat != null && dateFormat != 'undefined')
            return '/Date(' + moment(value, LONG_DATETIME_FORMAT).valueOf() + ')\/';
        else
            return '/Date(' + moment(value).valueOf() + ')\/';
    }
}

function toASPForReport(value, isLocal, dateFormat) {

    if (isLocal) {
        if (dateFormat != null && dateFormat != 'undefined')
            return '/Date(' + moment(value, LONG_DATETIME_FORMAT).valueOf() + moment(value, LONG_DATETIME_FORMAT).format('ZZ') + ')\/';
        else
            return '/Date(' + moment(value).valueOf() + moment(value).format('ZZ') + ')\/';
    }
    else {
        if (dateFormat != null && dateFormat != 'undefined')
            return '/Date(' + moment(value, LONG_DATETIME_FORMAT).valueOf() + moment(value, LONG_DATETIME_FORMAT).format('ZZ') + ')\/';
        else
            return '/Date(' + moment(value).valueOf() + moment(value).format('ZZ') + ')\/';
    }
}

function dateCompare(data1, date2) {
    if (moment(date1).isSame(date2))
        return 0;

    if (moment(date1).isAfter(date2))
        return 1;

    if (moment(date1).isBefore(date2))
        return -1;
}

function dateCompareForSchedule(dateStart, hoursStart, minutesStart, ampmStart, dateEnd, hoursEnd, minutesEnd, ampmEnd) {
    var hoursFirst;
    var hoursSecond;
    var minutesFirst;
    var minutesSecond;

    if (hoursStart >= 10) {
        hoursFirst = hoursStart;
    } else {
        hoursFirst = "0" + hoursStart;
    }

    if (hoursEnd >= 10) {
        hoursSecond = hoursEnd;
    } else {
        hoursSecond = "0" + hoursEnd;
    }

    if (minutesStart >= 10) {
        minutesFirst = minutesStart;
    } else {
        minutesFirst = "0" + minutesStart;
    }

    if (minutesEnd >= 10) {
        minutesSecond = minutesEnd;
    } else {
        minutesSecond = "0" + minutesEnd;
    }

    var fromDate = dateStart + ' ' + hoursFirst + ':' + minutesFirst + ' ' + ampmStart;

    var toDate = dateEnd + ' ' + hoursSecond + ':' + minutesSecond + ' ' + ampmEnd;

    var startDateParse = new Date(Date.parse(fromDate));
    var endDateParse = new Date(Date.parse(toDate));

    if (startDateParse > endDateParse) {
        return 1;
    } else {
        return 0;
    }
}

function dateDifferenceForSchedule(dateStart, hoursStart, minutesStart, ampmStart,
    dateEnd, hoursEnd, minutesEnd, ampmEnd) {
    var hoursFirst = hoursStart >= 10 ? hoursStart : "0" + hoursStart;
    var hoursSecond = hoursEnd >= 10 ? hoursEnd : "0" + hoursEnd;
    var minutesFirst = minutesStart >= 10 ? minutesStart : "0" + minutesStart;
    var minutesSecond = minutesEnd >= 10 ? minutesEnd : "0" + minutesEnd;

    var fromDate = dateStart + ' ' + hoursFirst + ':' + minutesFirst + ' ' + ampmStart;
    var toDate = dateEnd + ' ' + hoursSecond + ':' + minutesSecond + ' ' + ampmEnd;
    var startDateParse = new Date(Date.parse(fromDate));
    var endDateParse = new Date(Date.parse(toDate));

    var hours = (endDateParse - startDateParse) / 36e5;
    //  console.log("hours difference : "+ hours);
    return hours;
}

function dateCompareForScheduleIffEqual(dateStart, hoursStart, minutesStart, ampmStart, dateEnd, hoursEnd, minutesEnd, ampmEnd) {
    var hoursFirst;
    var hoursSecond;
    var minutesFirst;
    var minutesSecond;

    if (hoursStart >= 10) {
        hoursFirst = hoursStart;
    } else {
        hoursFirst = "0" + hoursStart;
    }

    if (hoursEnd >= 10) {
        hoursSecond = hoursEnd;
    } else {
        hoursSecond = "0" + hoursEnd;
    }

    if (minutesStart >= 10) {
        minutesFirst = minutesStart;
    } else {
        minutesFirst = "0" + minutesStart;
    }

    if (minutesEnd >= 10) {
        minutesSecond = minutesEnd;
    } else {
        minutesSecond = "0" + minutesEnd;
    }

    var fromDate = dateStart + ' ' + hoursFirst + ':' + minutesFirst + ' ' + ampmStart;

    var toDate = dateEnd + ' ' + hoursSecond + ':' + minutesSecond + ' ' + ampmEnd;

    var startDateParse = new Date(Date.parse(fromDate));
    var endDateParse = new Date(Date.parse(toDate));

    if (startDateParse > endDateParse) {
        return 1;
    } else {

        if (dateStart == dateEnd && hoursFirst == hoursSecond && minutesFirst == minutesSecond && ampmStart == ampmEnd) {
            return 1;
        } else {
            return 0;
        }
    }
}

function dateCompareForAlert(dateStart, hoursStart, minutesStart, ampmStart, dateEnd, hoursEnd, minutesEnd, ampmEnd) {
    var hoursFirst;
    var hoursSecond;
    var minutesFirst;
    var minutesSecond;


    var fromDate = dateStart + ' ' + hoursStart + ':' + minutesStart + ' ' + ampmStart;

    var toDate = dateEnd + ' ' + hoursEnd + ':' + minutesEnd + ' ' + ampmEnd;

    var startDateParse = new Date(Date.parse(fromDate));
    var endDateParse = new Date(Date.parse(toDate));

    if (startDateParse > endDateParse) {
        return 1;
    } else {
        return 0;
    }
}
function jsonLocalDateConversion(value, format) {
    var date;
    if (format == null || format == 'undefined') {
        format = LONG_DATETIME_FORMAT_AMPM;
    }
    if (value != null && value != 'undefined') {
        var localTime = moment.utc(moment(value).format('YYYY-MM-DD HH:mm:ss')).toDate();
        localTime = moment(localTime).format(LONG_DATETIME_FORMAT_AMPM);
        return localTime;
    }

}

function jsonDateConversion(value, format) {
    return moment(value).format(format);
}

function jsonDateConversionForCharts(value, format) {
    if (value.toUpperCase().indexOf("Z") == -1) {
        value = value + 'Z';
    }
    return moment.utc(moment(value)).format(format);
}

function getlocaldate1(date, hours, minutes) {
    var formatedDate = '';
    if (date != null && date != 'undefined') {
        var dateObject = new Date(date);
        dateObject.setHours(hours);
        dateObject.setMinutes(minutes);
        dateObject.setSeconds(0);
        formatedDate = moment(dateObject).format(LONG_DATETIME_FORMAT);
    }
    return formatedDate;
}

function getlocaldateForDashboard(value, date, hours, minutes) {
    var formatedDate = '';
    if (date != null && date != 'undefined') {
        var dateObject = new Date(date);
        dateObject.setHours(hours);
        dateObject.setMinutes(minutes);
        var dateFormat = moment.utc(dateObject).format("YYYY-MM-DD");
        var dateHours = moment.utc(dateObject).format("HH");
        var dateMinutes = moment.utc(dateObject).format("mm");
        if (value == 'from') {
            formatedDate = dateFormat + "T" + dateHours + ":" + dateMinutes + ":00Z";
        } else {
            formatedDate = dateFormat + "T" + dateHours + ":" + dateMinutes + ":59Z";
        }
    }
    return formatedDate;
}

function getUtcDate1(date, hours, minutes) {
    var formatedDate = '';
    if (date != null && date != 'undefined') {
        var dateObject = new Date(date);
        dateObject.setHours(hours);
        dateObject.setMinutes(minutes);
        dateObject.setSeconds(0);
        formatedDate = moment.utc(dateObject).format('YYYY-MM-DD') + 'T' + moment.utc(dateObject).format('HH:mm:SS') + 'Z';
    }
    return formatedDate;
}

function getUtcDate(date, time1) {
    var date = moment(date).format('YYYY-MM-DD');
    var time = moment().format('HH:MM:SS');
    var formatedDate = date + 'T' + time + 'Z';
    return formatedDate;
}

function dateTimeToLocalDateTimeString(year, month, date, hour, min) {
    //downloadOn = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds(), today.getMilliseconds());
    var dateObject = new Date(year, month, date, hour, min, 0, 0);
    var fullYear = dateObject.getFullYear();
    var month = dateObject.getMonth() + 1;
    var day = dateObject.getDate();
    var dateString = fullYear + "-" + leadingZero(month) + "-" + leadingZero(day) + "T" + leadingZero(hour) + ":" + leadingZero(min) + ":00";
    return dateString;		// zzz is .net representation of local date time
}
function dateTimeConversionDateFormat(year, month, date, hour, min, sec) {
    var dateObject = new Date(year, month, date, hour, min, sec);
    var fullYear = dateObject.getFullYear();
    var month = dateObject.getMonth() + 1;
    var day = dateObject.getDate();
    var dateString = fullYear + "-" + leadingZero(month) + "-" + leadingZero(day) + "T" + leadingZero(hour) + ":" + leadingZero(min) + ":" + leadingZero(sec);
    return dateString;		// zzz is .net representation of local date time
}
function dateTimeConversionStringFormat(year, month, date, hour, min, sec) {
    var dateObject = new Date(year, month, date, hour, min, sec);
    var fullYear = dateObject.getFullYear();
    var month = dateObject.getMonth() + 1;
    var day = dateObject.getDate();
    var dateString = fullYear + "-" + leadingZero(month) + "-" + leadingZero(day) + "T" + leadingZero(hour) + ":" + leadingZero(min) + ":" + leadingZero(sec) + "Z";
    return dateString;		// zzz is .net representation of local date time
}
function dateTimeToLocalDateTimeStringDate(date, hour, min) {
    //downloadOn = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds(), today.getMilliseconds());
    var dateObject = new Date(date);
    var fullYear = dateObject.getFullYear();
    var month = dateObject.getMonth() + 1;
    var day = dateObject.getDate();
    var dateString = fullYear + "-" + leadingZero(month) + "-" + leadingZero(day) + "T" + leadingZero(hour) + ":" + leadingZero(min) + ":00";
    return dateString;		// zzz is .net representation of local date time
}
function leadingZero(value) {
    if (value < 10) {
        return "0" + value;
    }
    return value;
}

function convertLocalDateTimeToUTC(date) {
    var newDate = new Date(date);
    var offsetMilliseconds = newDate.getTimezoneOffset() * 60 * 1000;
    newDate.setTime(newDate.getTime() + offsetMilliseconds);
    return newDate;
}

function CreatJSONDate(val, dateFormat) {
    var date = toASP(val, false, dateFormat);
    return date;
}

function CreatJSONDateLocal(val, dateFormat) {

    var date = toASP(val, true, dateFormat);

    return date;

}

function CreatJSONDateForReport(val, dateFormat) {
    var date = toASPForReport(val, false, dateFormat);
    return date;
}

function ajaxErrorHandler(jqXHR, status, error) {
    var statusMessage = '';
    if (jqXHR.status === 0) {
        statusMessage = i18n.t('E_Statuscode_0', { lng: lang });
    } else if (jqXHR.status == 302) {
        statusMessage = jqXHR.responseText;
        var querystring = jqXHR.url;
        if (querystring.indexOf("wa=wsignin1.0") > -1) {
            // location.href = AppConstants.get('LOGOUT_URL');
        }
    } else if (jqXHR.status == AppConstants.get('UNAUTHORIZED')) {
        statusMessage = i18n.t('E_Statuscode_401', { lng: lang });
        //  location.href = AppConstants.get('LOGOUT_URL');
    } else if (jqXHR.status == AppConstants.get('FORBIDDEN')) {
        statusMessage = i18n.t('E_Statuscode_403', { lng: lang });
        //  location.href = AppConstants.get('LOGOUT_URL');
    } else if (jqXHR.status == AppConstants.get('NOT_FOUND')) {
        statusMessage = i18n.t('E_Statuscode_404', { lng: lang });
    } else if (jqXHR.status == AppConstants.get('INTERNAL_SERVER_ERROR')) {
        statusMessage = i18n.t('E_Statuscode_500', { lng: lang });
    } else if (status === 'parsererror') {
        statusMessage = i18n.t('E_Request_Json_Parser', { lng: lang });
    } else if (status === 'timeout') {
        statusMessage = i18n.t('E_Request_Timeout', { lng: lang });
    } else if (status === 'abort') {
        statusMessage = i18n.t('E_Request_Aborted', { lng: lang });
    } else {
        statusMessage = i18n.t('E_Uncaught_Error', { lng: lang }) + jqXHR.responseText;
    }
    console.log(statusMessage);
}

function ajaxErrorHandlerForWebAPI(jqXHR, status, error) {
    if (jqXHR.status === AppConstants.get('GET_SUCCESS')) {                     //200

    } else if (jqXHR.status == AppConstants.get('CREATED')) {                   //201

    } else if (jqXHR.status == AppConstants.get('GET_NO_CONTENT')) {            //204

    } else if (jqXHR.status == AppConstants.get('PARTIAL_UPDATE_1')) {          //206

    } else if (jqXHR.status == AppConstants.get('PARTIAL_UPDATE_1')) {          //207

    } else if (jqXHR.status == AppConstants.get('NOT_MODIFIED')) {              //304

    } else if (jqXHR.status == AppConstants.get('BAD_REQUEST')) {               //400
        openAlertpopup(2, 'E_Statuscode_400');
    } else if (jqXHR.status == AppConstants.get('UNAUTHORIZED')) {              //401
        openAlertpopup(2, 'E_Statuscode_401');
    } else if (jqXHR.status == AppConstants.get('FORBIDDEN')) {                 //403

    } else if (jqXHR.status == AppConstants.get('NOT_FOUND')) {                 //404

    } else if (jqXHR.status == AppConstants.get('CONFLICTS')) {                 //409

    } else if (jqXHR.status == AppConstants.get('INTERNAL_SERVER_ERROR')) {     //500
        openAlertpopup(2, 'internal_error_api');
    }
}

function ajaxJsonCall(method, params, callback, async, type, loadingflag, isMongoUrl, controllername) {

    if (async == null) {
        async = true;
    } else {
        async = async;
    }
    if (type == null) {
        type = "POST"
    } else {
        type = type;
    }

    var customerName = window.sessionStorage.getItem("CustomerName");
    var customerId = window.sessionStorage.getItem("CustomerId");
    var TokenId = window.sessionStorage.getItem("TokenId");
    var externalUserName = window.sessionStorage.getItem("externalUserName");
    $.ajax({
        type: type,
        async: async,
        beforeSend: function (request) {
            //request.setRequestHeader("CustomerName", customerName);
            //request.setRequestHeader("TokenId", TokenId);
            //request.setRequestHeader("Content-Length", 49990);

            if (EOAccessToken && EOAccessToken != "") {
                request.setRequestHeader("CustomerId", customerId);
                request.setRequestHeader("Authorization", "Bearer " + EOAccessToken);
                request.setRequestHeader("externalUserName", externalUserName ? externalUserName : '');
            }

            if (loadingflag) {
                $("#loadingDiv").show();
            }
        },
        complete: function () {
            if (loadingflag) {
                $("#loadingDiv").hide();
            }
        },
        contentType: 'application/json; charset=utf-8',
        dataType: "json",
        url: GetDataServiceUrl(method, isMongoUrl, controllername),
        data: params,
        success: function (data, status, req, xml, xmlHttpRequest, responseXML) {
            if (VHQFlag === true) {
                if (data.responseStatus.StatusCode == AppConstants.get('SYSTEM_BUSY')) {												//263
                    openAlertpopup(2, 'system_busy_try_again');
                } else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {							//12
                    Token_Expired();
                } else if (data.responseStatus.StatusCode == AppConstants.get('USER_LOGOUT_REQUIRED')) {							//401
                    Auth_Expired();
                } else if (data.responseStatus.StatusCode == AppConstants.get('INTERNAL_ERROR') && method != "GetLastAlertDateTime") {	//112
                    openAlertpopup(2, 'internal_error_api');
                } else if (data.responseStatus.StatusCode == AppConstants.get('UNAUTHORIZED_ACCESS')) {									//11
                    openAlertpopup(1, 'User_does_not_have_sufficient_privileges');
                } else if (data.responseStatus.StatusCode == AppConstants.get('UNAUTHORIZED_ACCESS_HIERARCHY')) {									//402
                    openAlertpopup(1, 'User_does_not_have_sufficient_privileges_Hierarchy');
                } else if (data.responseStatus.StatusCode == AppConstants.get('E_INVALID_INPUT_FORMAT')) {								//304
                    openAlertpopup(2, 'invalid_input');
                }
                return callback(data, null);
            } else {
                return callback(data, null);
            }
        },
        error: function (jqXHR, status, error) {
            $("#loadingDiv").hide();
            if (error) {
                //Capturing console log to find netwrok related issues : VHQ-12754
                console.log("ajaxJsonCall from method-" + method + " Exception info-" + error.message);
            }

            if (jqXHR != null) {
                ajaxErrorHandler(jqXHR, status, error);
                if (jqXHR.status == AppConstants.get('FORBIDDEN')) {				//403
                    if (jqXHR.responseText.indexOf('E_INVALID_INPUT_FORMAT') > -1)
                        openAlertpopup(2, 'invalid_input_format');
                    else
                        openAlertpopup(2, 'network_error');
                    return callback(null, jqXHR);
                } else if (jqXHR.status != AppConstants.get('UNAUTHORIZED')) {		//401
                    if (method != "GetLastAlertDateTime")   //GetLastAlertDateTime will be called every 60000ms in the background, no need to show error popup
                        openAlertpopup(2, 'network_error');
                    return callback(null, jqXHR);
                }
            } else {
                return callback(null, jqXHR);
            }
        }
    });
}

function GetDataServiceUrl(method, isMongoUrl, controllername) {
    if (isMongoUrl && controllername) {
        return AppConstants.get('MONGO_API_URL') + "/" + controllername + "/" + method;
    }
    else {
        return AppConstants.get('API_URL') + "/" + method;
    }
}
function ajaxJsonCallWebAPI(method, params, callback, async, type, loadingflag) {

    if (async == null) {
        async = true;
    } else {
        async = async;
    }
    if (type == null) {
        type = "POST"
    } else {
        type = type;
    }

    var customerName = window.sessionStorage.getItem("CustomerName");
    var TokenId = window.sessionStorage.getItem("TokenId");
    $.ajax({
        type: type,
        async: async,
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", TOKEN());

            if (loadingflag) {
                $("#loadingDiv").show();
            }
        },
        complete: function () {
            if (loadingflag) {
                $("#loadingDiv").hide();
            }
        },
        contentType: 'application/json; charset=utf-8',
        dataType: "json",
        url: AppConstants.get('GATEWAY_API_URL') + "/" + method,
        data: params,
        success: function (data, status, xhr) {
            return callback(data, xhr);
        },
        error: function (xhr, status, error) {
            if (error) {
                //Capturing console log to find netwrok related issues : VHQ-12754
                console.log("ajaxJsonCallWebAPI from method-" + method + " Exception info-" + error.message);
            }

            if (xhr != null) {
                ajaxErrorHandlerForWebAPI(xhr, status, error);
                return callback(null, xhr);
            } else {
                return callback(null, xhr);
            }
        }
    });
}

function ajaxJsonCallFileUpload(method, params, callback, async, type, loadingflag) {
    if (async == null) {
        async = true;
    } else {
        async = async;
    }
    if (type == null) {
        type = "POST"
    } else {
        type = type;
    }

    $.ajax({
        type: type,
        async: async,
        url: AppConstants.get('FILE_UPLOAD_URL'),
        data: params,
        beforeSend: function () {
            if (VHQFlag == false && EOAccessToken != "") {
                request.setRequestHeader("Authorization", "Bearer " + EOAccessToken);
            }
            if (loadingflag) {
                $("#loadingDiv").show();
            }
        },
        complete: function () {
            if (loadingflag) {
                $("#loadingDiv").hide();
            }
        },
        contentType: 'application/json',
        dataType: "json",
        success: function (data, status, req, xml, xmlHttpRequest, responseXML) {
            return callback(data, null);
        },
        error: function (jqXHR, status, error) {
            if (error) {
                //Capturing console log to find netwrok related issues : VHQ-12754
                console.log("ajaxJsonCallFileUpload from method-" + method + " Exception info-" + error.message);
            }

            if (jqXHR != null) {
                ajaxErrorHandler(jqXHR, status, error)
                if (jqXHR.status != 401) {
                    return callback(null, jqXHR);
                }
            } else {
                return callback(null, jqXHR);
            }
        }
    });
}

function ajaxFileUploadStream(method, uploadRequestObj, callback, type, async, loadingflag) {
    if (async == null) {
        async = true;
    } else {
        async = async;
    }
    if (type == null) {
        type = "POST"
    } else {
        type = type;
    }
    var userData = JSON.parse(sessionStorage.getItem("userrData"));
    var customerName = window.sessionStorage.getItem("CustomerName");
    var TokenId = window.sessionStorage.getItem("TokenId");

    var queryparameters = '?fileName=' + uploadRequestObj.fileName + '&token=' + TokenId + '&user=' + userData[0].LoginName + '&customer=' + customerName + '&packageType=' + uploadRequestObj.PackageType;

    $.ajax({
        url: AppConstants.get('FILE_UPLOAD_STREAM_URL') + '/' + method + queryparameters,
        type: 'POST',
        data: uploadRequestObj.file,
        cache: false,
        processData: false, // Don't process the files
        contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request        
        success: function (data, status, req, xml, xmlHttpRequest, responseXML) {
            return callback(data, null);
        },
        error: function (msg) {
            return callback(null, msg);
        }
    });
}

function getResourceData(lang, document, resourceStorage, defaultLanguage) {
    console.log("Resource file get");
    var returnVal;
    $.ajax({
        type: "GET",
        url: AppConstants.get('LOCALIZEDPATH') + '/resource-' + lang + '.json',
        contentType: 'application/json; charset=utf-8',
        dataType: "json",
        async: false,
        success: function (data) {
            selectedLanguage = lang;
            returnVal = data;
            seti18nResourceData(document, returnVal);
            console.log("Resource file loaded");
        },
        error: function (jqXHR, status, error) {
            console.log("Resource file load error");
            if (error) {
                //Capturing console log to find network related issues : VHQ-12754
                console.log("getResourceData from lang-" + lang + " Exception info-" + error);
            }
            var recall = false;
            if (status == 'parsererror') {
                recall = true;
                selectedLanguage = defaultLanguage;
                returnVal = getResourceData(selectedLanguage, document, resourceStorage, defaultLanguage);
            } else {
                if (jqXHR != null) {
                    if (jqXHR.status === 404) {
                        recall = true;
                        selectedLanguage = defaultLanguage;
                        returnVal = getResourceData(selectedLanguage, document, resourceStorage, defaultLanguage);
                    }
                } else {
                    openAlertpopup(2, 'network_error');
                }
            }
            if (!recall) {
                resourceStorage = '';
                returnVal = '';
            }

        }
    });
    return returnVal;
}

function seti18nResourceData(document, resourceStorage) {
    try {
        if (resourceStorage != undefined || resourceStorage != '') {
            $(document).ready(function () {
                setTimeout(function () {
                    i18n.init({
                        "lng": selectedLanguage,
                        "resStore": resourceStorage,
                        "fallbackLng": defaultLanguage,
                        "debug": false,
                        "useDataAttrOptions": true
                    }, function (t) {
                        $(document).i18n();
                    });
                    console.log("Document is ready for resource key-value mapping");
                }, 0);
            });
        } else {
            console.log("Resource file set calls get - resourceStorage undefined");
            getResourceData(defaultLanguage, document, resourceStorage, defaultLanguage);
        }
    } catch (e) {
        if (e)
            console.log("Method-seti18nResourceData Exception - " + e.message);
    }
}
function callXHRRequestInterceptor() {
    var realOpenXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
        var res = realOpenXHR.apply(this, arguments);
        var err = new Error();
        var customerName = window.sessionStorage.getItem("CustomerName");
        var TokenId = window.sessionStorage.getItem("TokenId");
        if (url.toUpperCase().indexOf("UPLOADSERVICE.SVC/UPLOADFILE") == -1) {
            this.setRequestHeader("CustomerName", customerName);
            this.setRequestHeader("TokenId", TokenId);
        }
        return res;
    };
}

function getWeekMinMaxDateForDashboard(inputDate) {
    var currentDate = moment(inputDate).format(SHORT_DATE_FORMAT);
    var date = inputDate;
    date.setDate(date.getDate() + 7);
    date = moment(date).format("MM-DD-YYYY");

    var objWeekDate = new Object();
    objWeekDate.minDate = currentDate;
    objWeekDate.maxDate = date;

    return objWeekDate;
}
function validateFileNameFormat(value) {
    //File name can't contain any of the following characters \ / : * ? '' < > | .
    var filenameRegEx = "^[^\\\/:\*\?\"<>\|\.][A-Z,a-z,0-9,' .()_-]+\.[A-Z,a-z,0-9]{2,6}$";

    var checkVal = validationOfRegExpression(value, filenameRegEx);
    if (checkVal == false) {
        return false;
    } else {
        return true;
    }
}
function validationOfRegExpression(newValue, regularExression) {
    var regExpval = new RegExp(regularExression);
    if ((regExpval.test(newValue)) == false) {
        return false;
    } else {
        return true;
    }
}
function openAlertpopup(flage, msg, names) {

    if (flage == 0) {

        $("#informationPopup").modal("show");
        $("#infoHead").text(i18n.t('success', { lng: lang }));
        $("#infoHead").addClass('c-green');
        $("#infoHead").removeClass('c-blue');
        $("#infoHead").removeClass('c-red');
        $("#infoicon").removeClass('icon-information c-blue');
        $("#infoicon").removeClass('icon-times-circle c-red');
        $("#infoicon").addClass('icon-checkmark c-green');
        $("#infoBtnOk").removeClass('btn-danger');
        $("#infoBtnOk").removeClass('btn-primary');
        $("#infoBtnOk").addClass('btn-success');
        $("#infoMessage").text(i18n.t(msg, names, { lng: lang }));
    } else if (flage == 1) {
        $("#informationPopup").modal("show");
        $("#infoHead").text(i18n.t('information_title', { lng: lang }));
        $("#infoHead").addClass('c-blue');
        $("#infoHead").removeClass('c-green');
        $("#infoHead").removeClass('c-red');
        $("#infoicon").removeClass('icon-times-circle c-red');
        $("#infoicon").removeClass('icon-checkmark c-green');
        $("#infoicon").addClass('icon-information c-blue');
        $("#infoBtnOk").removeClass('btn-danger');
        $("#infoBtnOk").removeClass('btn-success');
        $("#infoBtnOk").addClass('btn-primary');
        $("#infoMessage").text(i18n.t(msg, names, { lng: lang }));
    } else if (flage == 2) {
        $("#informationPopup").modal("show");
        $("#infoHead").text(i18n.t('error', { lng: lang }));
        $("#infoHead").addClass('c-red');
        $("#infoHead").removeClass('c-green');
        $("#infoHead").removeClass('c-blue');
        $("#infoicon").removeClass('icon-checkmark c-green');
        $("#infoicon").removeClass('icon-information c-blue');
        $("#infoicon").addClass('icon-times-circle c-red');
        $("#infoBtnOk").removeClass('btn-primary');
        $("#infoBtnOk").removeClass('btn-success');
        $("#infoBtnOk").addClass('btn-danger');
        $("#infoMessage").text(i18n.t(msg, names, { lng: lang }));
    } else if (flage == 3) {
        $("#informationPopup").modal("show");
        $("#infoHead").text(i18n.t('notification_title', { lng: lang }));
        $("#infoHead").addClass('c-blue');
        $("#infoHead").removeClass('c-green');
        $("#infoHead").removeClass('c-red');
        $("#infoicon").removeClass('icon-times-circle c-red');
        $("#infoicon").removeClass('icon-checkmark c-green');
        $("#infoicon").addClass('icon-information c-blue');
        $("#infoBtnOk").removeClass('btn-danger');
        $("#infoBtnOk").removeClass('btn-success');
        $("#infoBtnOk").addClass('btn-primary');
        $("#infoMessage").text(i18n.t(msg, names, { lng: lang }));
    } else if (flage == 4) {
        $("#informationPopup").modal("show");
        $("#infoHead").text(i18n.t('confirmation_title', { lng: lang }));
        $("#infoHead").addClass('c-blue');
        $("#infoHead").removeClass('c-green');
        $("#infoHead").removeClass('c-red');
        $("#infoicon").removeClass('icon-times-circle c-red');
        $("#infoicon").removeClass('icon-checkmark c-green');
        $("#infoicon").addClass('icon-information c-blue');
        $("#infoBtnOk").removeClass('btn-danger');
        $("#infoBtnOk").removeClass('btn-success');
        $("#infoBtnOk").addClass('btn-primary');
        $("#infoMessage").text(i18n.t(msg, names, { lng: lang }));
    } else if (flage == 5) {
        $("#informationPopup").modal("show");
        $("#infoHead").text(i18n.t('invalid_xml', { lng: lang }));
        $("#infoHead").addClass('c-red');
        $("#infoHead").removeClass('c-green');
        $("#infoHead").removeClass('c-blue');
        $("#infoicon").removeClass('icon-checkmark c-green');
        $("#infoicon").removeClass('icon-information c-blue');
        $("#infoicon").addClass('icon-times-circle c-red');
        $("#infoBtnOk").removeClass('btn-primary');
        $("#infoBtnOk").removeClass('btn-success');
        $("#infoBtnOk").addClass('btn-danger');
        $("#infoMessage").text(i18n.t(msg, names, { lng: lang }));
    } else if (flage == 6) {
        $("#informationPopup").modal("show");
        $("#infoHead").text(i18n.t('invalid_csv', { lng: lang }));
        $("#infoHead").addClass('c-red');
        $("#infoHead").removeClass('c-green');
        $("#infoHead").removeClass('c-blue');
        $("#infoicon").removeClass('icon-checkmark c-green');
        $("#infoicon").removeClass('icon-information c-blue');
        $("#infoicon").addClass('icon-times-circle c-red');
        $("#infoBtnOk").removeClass('btn-primary');
        $("#infoBtnOk").removeClass('btn-success');
        $("#infoBtnOk").addClass('btn-danger');
        $("#infoMessage").text(i18n.t(msg, names, { lng: lang }));
    }


}

function openDAtefilterAlertpopup(msg) {


    $("#datefilterPopup").modal("show");
    $("#dateinfoHead").text(i18n.t('information_title', { lng: lang }));
    $("#dateinfoHead").addClass('c-blue');
    $("#dateinfoHead").removeClass('c-green');
    $("#dateinfoHead").removeClass('c-red');
    $("#dateinfoicon").removeClass('icon-times-circle c-red');
    $("#dateinfoicon").removeClass('icon-checkmark c-green');
    $("#dateinfoicon").addClass('icon-information c-blue');
    $("#dateinfoBtnOk").removeClass('btn-danger');
    $("#dateinfoBtnOk").removeClass('btn-success');
    $("#dateinfoBtnOk").addClass('btn-primary');
    $("#dateinfoMessage").text(i18n.t(msg, { lng: lang }));

}
function openinvalidXMLorCSVPopup(msg, url) {

    $("#invalidXMLorCSVPopup").modal("show");
    $("#invalidinfoHead").text(i18n.t('information_title', { lng: lang }));
    $("#invalidinfoHead").addClass('c-blue');
    $("#invalidinfoHead").removeClass('c-green');
    $("#invalidinfoHead").removeClass('c-red');
    $("#invalidinfoicon").removeClass('icon-times-circle c-red');
    $("#invalidinfoicon").removeClass('icon-checkmark c-green');
    $("#invalidinfoicon").addClass('icon-information c-blue');
    $("#invalidinfoBtnOk").removeClass('btn-danger');
    $("#invalidinfoBtnOk").removeClass('btn-success');
    $("#invalidinfoBtnOk").addClass('btn-primary');
    $("#invalidinfoMessage").text(i18n.t(msg, { lng: lang }));
    invalidXMLLogFileUrl = url;
}
function getRouteUrl() {
    var routeUrl = window.location.hash;
    routeUrl = routeUrl.substr(1, routeUrl.length);
    var nestedRoutePath = routeUrl.split('/');

    return nestedRoutePath;
}

function mainMenuSetSelection(id) {

    $("#mainMenuUl").each(function () {
        $(this).children('li').removeClass('active');
        // $(this).children('li').children('a').removeClass('arrow-open');
        $(this).children('li').children('ul').children('li').children('ul').children('li').removeClass('active');
    });
    $("#" + id).addClass('active active-1');

    $("#" + id).children('a').addClass('arrow-open');
}


function childMenuSetSelection(childId) {
    $("#childUl" + childId).each(function () {
        $(this).children('li').removeClass('active');
        //$(this).children('li').children('a').removeClass('arrow-open');
    });
    $("#" + childId).addClass('active active-1');

    $("#" + childId).children('a').addClass('arrow-open');
}

function removeSetMenuSelection(id) {

    $("#mainMenuUl").each(function () {
        $(this).children('li').removeClass('active');
        //$(this).children('li').removeClass('expand');
        //  $(this).children('li').children('a').removeClass('arrow-open');
        $(this).children('li').children('ul').children('li').removeClass('active');
        // $(this).children('li').children('ul').children('li').children('a').removeClass('arrow-open');
    });
    $("#" + id).addClass('active active-1');

    $("#" + id).children('a').addClass('arrow-open');
}


function setMenuSelection() {
    $("#mainMenuUl").children('li').each(function () {
        $(this).children('ul').children('li').each(function () {
            $(this).removeClass('active');
            $(this).removeClass('expand');
            //   $(this).children('a').removeClass('arrow-open');
            $(this).children('ul').children('li').each(function () {
                $(this).children('a').removeClass('active');
                //     $(this).children('a').removeClass('arrow-open');
                $(this).children('ul').children('li').each(function () {
                    $(this).children('a').removeClass('active');
                })
            });
        })
    });

    var nestedRoutePath = getRouteUrl();

    if (nestedRoutePath.length == 1) {
        $("#mainMenuUl").children('li').each(function () {
            $(this).removeClass('active');
            $(this).removeClass('expand');
            // $(this).children('a').removeClass('arrow-open');
            $(this).children('ul').children('li').each(function () {
                $(this).removeClass('active');
                $(this).removeClass('expand');
                // $(this).children('a').removeClass('arrow-open');
                $(this).children('ul').children('li').each(function () {
                    $(this).children('a').removeClass('active');
                    //    $(this).children('a').removeClass('arrow-open');
                    $(this).children('ul').children('li').each(function () {
                        $(this).children('a').removeClass('active');
                    })
                });
            })

        });
        $("#vhq").removeClass("active");
        $("#reports").addClass("active active-1 expand");
        $("#reports").children('a').addClass('arrow-open');
        $("#customReport").removeClass('active');
        $("#customReport").children('a').removeClass('arrow-open');
    }
    if (nestedRoutePath.length == 4) {
        $("#mainMenuUl").children('li').each(function () {
            $(this).removeClass('active');
            $(this).removeClass('expand');
            //  $(this).children('a').removeClass('arrow-open');
            $(this).children('ul').children('li').each(function () {
                $(this).removeClass('active');
                $(this).removeClass('expand');
                // $(this).children('a').removeClass('arrow-open');
                $(this).children('ul').children('li').each(function () {
                    $(this).children('a').removeClass('active');
                    //    $(this).children('a').removeClass('arrow-open');
                    $(this).children('ul').children('li').each(function () {
                        $(this).children('a').removeClass('active');
                    })
                });
            })

        });
        $("#vhq").removeClass("active");
        $("#" + nestedRoutePath[0]).addClass("active active-1 expand");

        $("#" + nestedRoutePath[3]).parent('ul').children('li').each(function () {
            //if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            //}

        });
        $("#" + nestedRoutePath[0]).children('a').addClass('arrow-open');
        $("#" + nestedRoutePath[3]).addClass('active')

        $("#" + nestedRoutePath[3]).children('a').addClass('arrow-open');
        $("#" + nestedRoutePath[2] + "sublink").addClass('active');
        if (nestedRoutePath[2] == 'scheduleActions' || nestedRoutePath[2] == 'scheduleDownload' || nestedRoutePath[2] == 'scheduleDelivery') {
            $("#" + nestedRoutePath[0]).children('ul').css('display', 'block');
            $("#deviceSearch").removeClass('active');
            if (nestedRoutePath[3] == 'manageContents') {

                $("#manageContents").children('ul').children('li').each(function () {
                    if ($(this).attr('id') == 'li1') {
                        $(this).children('a').addClass('active');
                        $("#schedulesublink").removeClass('active');
                        $("#scheduleActionssublink").removeClass('active');
                    }
                })
            }
            if (nestedRoutePath[3] == 'downloads') {

                $("#downloads").children('ul').children('li').each(function () {
                    if ($(this).attr('id') == 'li3') {
                        $(this).children('a').addClass('active');
                        $("#scheduleDeliverysublink").removeClass('active');
                        $("#scheduleActionssublink").removeClass('active');
                    }
                })
            }
            if (nestedRoutePath[3] == 'deviceAppBundles') {

                $("#deviceAppBundles").children('ul').children('li').each(function () {
                    if ($(this).attr('id') == 'li2') {
                        $(this).children('a').addClass('active');
                        $("#scheduleDeliverysublink").removeClass('active');
                        $("#scheduleActionssublink").removeClass('active');
                    }
                })
            }
            if (nestedRoutePath[3] == 'diagnostics') {
                $("#diagnostics").children('ul').css('display', 'block');
                $("#diagnostics").children('ul').children('li').each(function () {
                    if ($(this).attr('id') == 'li0') {
                        $(this).children('a').addClass('active');

                        $("#schedulesublink").removeClass('active');
                        $("#scheduleDeliverysublink").removeClass('active');
                    }
                })
            }
            if (nestedRoutePath[3] == 'mpdiagnostics') {
                $("#deviceDiagnostics").children('ul').css('display', 'block');
                $("#deviceDiagnostics").children('ul').children('li').each(function () {
                    if ($(this).attr('id') == 'li0') {
                        $(this).children('a').addClass('active');
                        $("#schedulesublink").removeClass('active');
                        $("#scheduleDeliverysublink").removeClass('active');
                    }
                })
            }
        }

    }
    if (nestedRoutePath.length == 3) {
        if (nestedRoutePath[nestedRoutePath.length - 1].indexOf('?') > -1) {
            nestedRoutePath[nestedRoutePath.length - 1] = nestedRoutePath[nestedRoutePath.length - 1].substring(0, nestedRoutePath[nestedRoutePath.length - 1].indexOf('?'));
        }
        $("#vhq").removeClass("active");
        $("#mainMenuUl").children('li').each(function () {
            $(this).removeClass('active');
            $(this).removeClass('expand');
            // $(this).children('a').removeClass('arrow-open');


        });

        $("#" + nestedRoutePath[2]).parent('ul').children('li').each(function () {
            //if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            //}

        });
        $("#" + nestedRoutePath[0]).addClass("active active-1 expand");
        $("#" + nestedRoutePath[0]).children('a').addClass('arrow-open');
        $("#" + nestedRoutePath[2]).addClass('active active-1')
        if (nestedRoutePath[2] == 'scheduleDelivery') {
            $("#" + nestedRoutePath[0]).children('ul').css('display', 'block');
            $("#deviceSearch").removeClass('active');
        }
        $("#standardReport").removeClass('active-1');

    }

    if (nestedRoutePath.length == 6) {
        $("#mainMenuUl").children('li').each(function () {
            $(this).removeClass('active');
            $(this).removeClass('expand');
            //   $(this).children('a').removeClass('arrow-open');

        });
        $("#vhq").removeClass("active");
        $("#" + nestedRoutePath[1]).addClass("active active-1 expand");
        $("#" + nestedRoutePath[1]).children('a').addClass('arrow-open');
        if (nestedRoutePath[0] == 'Standard') {

            $("#standardReport").addClass('active active-1 expand');
            $("#standardReport").children('a').addClass('arrow-open');
            $("#standardReport" + nestedRoutePath[5]).parent('li').addClass('active active-1 expand');
            $("#standardReport" + nestedRoutePath[5]).next('a').addClass('arrow-open');

            $("#standardReport" + nestedRoutePath[5]).parent('li').parent('ul').children('li').each(function () {
                $(this).children('ul').children('li').each(function () {
                    $(this).children('a').removeClass('active');
                })
            });

        } else if (nestedRoutePath[0] == 'Custom') {

            $("#customReport").addClass('active active-1 expand');
            $("#customReport").children('a').addClass('arrow-open');

            $("#customReport" + nestedRoutePath[5]).parent('li').addClass('active active-1 expand');
            $("#customReport" + nestedRoutePath[5]).next('a').addClass('arrow-open');
            $("#customReport" + nestedRoutePath[5]).parent('li').parent('ul').children('li').each(function () {
                $(this).children('ul').children('li').each(function () {
                    $(this).children('a').removeClass('active');
                })
            });
        } else {

            $("#" + nestedRoutePath[2]).addClass('active active-1 expand');
            $("#" + nestedRoutePath[2]).children('a').addClass('arrow-open');
        }

        $("#" + nestedRoutePath[3]).addClass('active');



    }
}

//Scroll to and highlight specific Hierarchy
function setScrollPositionForId(StartRecord) {
    if (hierarchyLipostionArr != '') {
        var source = _.where(hierarchyLipostionArr, { id: StartRecord });
        if (source != '') {
            $("#" + StartRecord + "Li").addClass('active');
            if ($("#" + StartRecord + "Li").parent('ul').parent('div').html() != undefined) {
                var divId = $("#" + StartRecord + "Li").parent('ul').parent('div')[0].id;
                //alert('divId  ' + divId);
                //$("#" + divId).scrollTop(source[0].position);
                var pos = $("#" + StartRecord + "Li").index()
                pos = pos * 37;
                $("#" + divId).scrollTop(pos);
            }
        }

    }
}

function setHierarchySelect(selectedHierarchyIDs) {

    //alert('selectedHierarchyIDs   ' + JSON.stringify(selectedHierarchyIDs))
    for (var i = 0; i < selectedHierarchyIDs.length; i++) {

        $("#" + selectedHierarchyIDs[i] + "Li").parent('ul').each(function () {

            $(this).children('li').removeClass('active');


        });

        //alert(selectedHierarchyIDs[i] + "Li")
        $("#" + selectedHierarchyIDs[i] + "Li").addClass('active');


        //alert($("#" + selectedHierarchyIDs[i] + "Li").index());

        //alert('hierarchyLipostionArr ' + JSON.stringify(hierarchyLipostionArr));

        if (hierarchyLipostionArr != '') {
            var source = _.where(hierarchyLipostionArr, { id: selectedHierarchyIDs[i] });
            if (source != '') {
                if ($("#" + selectedHierarchyIDs[i] + "Li").parent('ul').parent('div').html() != undefined) {
                    var divId = $("#" + selectedHierarchyIDs[i] + "Li").parent('ul').parent('div')[0].id;
                    //alert('divId  ' + divId);
                    //$("#" + divId).scrollTop(source[0].position);
                    var pos = $("#" + selectedHierarchyIDs[i] + "Li").index()
                    pos = pos * 37;
                    $("#" + divId).scrollTop(pos);
                }
            }

        }

    }

}


function setScrollPosition(scrollArr) {
    if (scrollArr != '') {
        for (var i = 0; i < scrollArr.length; i++) {
            if ($("#" + scrollArr[i].id + "Li").parent('ul').parent('div').html() != undefined) {
                var divId = $("#" + scrollArr[i].id + "Li").parent('ul').parent('div')[0].id;

                $("#" + divId).scrollTop(scrollArr[i].position);
            }
        }

    }

}

///Authorization
var userRightsGlobal = JSON.parse(sessionStorage.getItem("userRightData"));
function IsViewAllowed(userRightsGlobal) {
    return userRightsGlobal.IsviewAllowed;
}

function IsModifyAllowed(action) {
    var isView = false;
    if (null == userRightsGlobal)
        return Boolean(isView);

    for (var i = 0; userRightsGlobal.length > i; i++) {
        if (action == userRightsGlobal[i].RightName) {
            isView = IsModifyAllowed(userRightsGlobal[i]);
            break;
        }
    }
    return Boolean(isView);
}

function IsDeleteAllowed(userRightsGlobal) {
    return userRightsGlobal.IsDeleteAllowed;
}

function userHasViewAccess(action) {
    userRightsGlobal = JSON.parse(sessionStorage.getItem("userRightData"));
    var isView = false;
    if (null == userRightsGlobal)
        return Boolean(isView);

    for (var i = 0; userRightsGlobal.length > i; i++) {
        if (action == userRightsGlobal[i].RightName) {
            isView = IsViewAllowed(userRightsGlobal[i]);
            break;
        }
    }
    if (isView == false || isView == 'false' || isView == 'False') {
        isView = false;
    } else {
        isView = true;
    }

    return isView;
}

function repositionAdvanceSearchPopUp(modalContentId) {
    $("#" + modalContentId).css('left', '');
    $("#" + modalContentId).css('top', '');
}

function checkIsPopUpOPen() {

    var childrenConten = $("#mainScrenContent").find(".in.fade");
    var idsOfDiv_Modal = new Array();

    for (var b = 0; b < childrenConten.length; b++) {
        if (childrenConten[b].id == "" || childrenConten[b].id == undefined || childrenConten[b].id == null) {

        } else {
            idsOfDiv_Modal.push(childrenConten[b].id);
        }
    }
    if (idsOfDiv_Modal.length > 0) {
        setTimeout(function () {
            $("#mainPageBody").addClass("modal-open");
        }, 500)

    } else {
        setTimeout(function () {
            $("#mainPageBody").removeClass("modal-open");
        }, 500)

    }
}

function insertAt(array, index) {
    var arrayToInsert = Array.prototype.splice.apply(arguments, [2]);
    return insertArrayAt(array, index, arrayToInsert);
}

function insertArrayAt(array, index, arrayToInsert) {
    Array.prototype.splice.apply(array, [index, 0].concat(arrayToInsert));
    return array;
}

function reppositionPopUp(id) {
    $("#" + id).css('left', '');
    $("#" + id).css('top', '');
}

function createJSONTimeStamp(value) {
    return '/Date(' + moment.utc(moment(value).format('YYYY-MM-DD HH:mm:ss')).valueOf() + ')\/';
}


function convertToDeviceZonetimestamp(date) {
    if (date) {
        return moment(date).format(LONG_DATETIME_FORMAT_AMPM);
    } else {
        return '';
    }
}

function convertToLocaltimestamp(date) {
    if (date) {
        return CreatJSONDateLocal(date);
    } else {
        return '';
    }
}
function browserInfo() {
    var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
}


function columnWidth(gID) {

    var textData = new Array();
    var cols = $("#" + gID).jqxGrid("columns");
    for (var i = 0; i < cols.records.length; i++) {
        textData[i] = cols.records[i].datafield;
    }


    var columnarrayInfoForColumnWidth = new Array();
    var VisibleColumnCount = 0;
    var gridHeaderText = "";
    var gridWidth = $("#" + gID).width();
    for (var l = 0; l < textData.length; l++) {
        var columnInfo = new Object();

        columnInfo.isHidden = $("#" + gID).jqxGrid('getcolumnproperty', textData[l], 'hidden');
        if (columnInfo.isHidden == false) {
            VisibleColumnCount++;
            columnInfo.datafield = $("#" + gID).jqxGrid('getcolumnproperty', textData[l], 'datafield');
            columnInfo.width = $("#" + gID).jqxGrid('getcolumnproperty', textData[l], 'width');
            columnInfo.text = $("#" + gID).jqxGrid('getcolumnproperty', textData[l], 'text');
            gridHeaderText = gridHeaderText + columnInfo.text;
        }

        columnarrayInfoForColumnWidth.push(columnInfo);
    }


    if (VisibleColumnCount > 7) {

        for (m = 0; m < columnarrayInfoForColumnWidth.length; m++) {
            var textLength = "" + columnarrayInfoForColumnWidth[m].text + "";
            //alert(textLength.length * 12);

            $("#" + gID).jqxGrid('setcolumnproperty', columnarrayInfoForColumnWidth[m].datafield, 'minwidth', textLength.length * 12);
            $("#" + gID).jqxGrid('setcolumnproperty', columnarrayInfoForColumnWidth[m].datafield, 'width', 'auto');


            var minwidth = $("#" + gID).jqxGrid('getcolumnproperty', columnarrayInfoForColumnWidth[m].datafield, 'minwidth');
            var width = $("#" + gID).jqxGrid('getcolumnproperty', columnarrayInfoForColumnWidth[m].datafield, 'width');


        }
    } else {

    }


}

function reloadScrollBars() {
    document.documentElement.style.overflow = 'auto';  // firefox, chrome
    document.body.scroll = "yes"; // ie only
}

function unloadScrollBars() {
    document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    document.body.scroll = "no"; // ie only
}

function gridHeightFunction(gID, isPagination) {
    if (_.isEmpty($("#" + gID))) {
        return;
    }
    var gridGlobheight = $(window).height();
    if (isPagination == "1") {
        if ($("#" + gID).offset().top == 0) {
            gridGlobheight = (gridGlobheight - 200) - $(".fixed-footer").height() - 65;
        } else {
            gridGlobheight = (gridGlobheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 65;
        }

    } else if (isPagination == "2") {

        gridGlobheight = (gridGlobheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 75;

    } else if (isPagination == "3") {
        gridGlobheight = (gridGlobheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 300;

    } else if (isPagination == "4") {
        gridGlobheight = (gridGlobheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 45;

    } else if (isPagination == "schedule") {
        gridGlobheight = (gridGlobheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - $("#nextSchedule").height() - 90;

    } else if (isPagination == "60") {
        gridGlobheight = (gridGlobheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 60;

    } else if (isPagination == "30") {
        gridGlobheight = (gridGlobheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 40;

    } else if (isPagination == "library") {

        if ($("#" + gID).offset().top == 0) {
            gridGlobheight = (gridGlobheight - 300) - $(".fixed-footer").height() - 10;

        } else {
            gridGlobheight = (gridGlobheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 10;
        }
    } else if (isPagination == "DevSearch") {
        if ($("#" + gID).offset().top == 0) {
            gridGlobheight = (gridGlobheight - 200) - $(".fixed-footer").height() - 60;
        } else {
            gridGlobheight = (gridGlobheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 60;
        }





    } else if (isPagination == "50") {


        if ($("#" + gID).offset().top == 0) {

            gridGlobheight = (gridGlobheight - 325) - $(".fixed-footer").height() - 50;
        } else {

            gridGlobheight = (gridGlobheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 50;
        }

    } else if (isPagination == "DevDetail") {

        if ($("#" + gID).offset().top == 0) {
            gridGlobheight = (gridGlobheight - 325) - $(".fixed-footer").height() - 90;

        } else {
            gridGlobheight = (gridGlobheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 90;

        }

    } else if (isPagination == "40") {

        if ($("#" + gID).offset().top == 0) {
            gridGlobheight = (gridGlobheight - 325) - $(".fixed-footer").height() - 40;
        } else {
            gridGlobheight = (gridGlobheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 40;
        }



    } else if (isPagination == "Export") {

        if ($("#" + gID).offset().top == 0) {
            gridGlobheight = (gridGlobheight - 200) - $(".fixed-footer").height() - 50;
        } else {
            gridGlobheight = (gridGlobheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 50;
        }

    } else {
        if ($("#" + gID).offset().top == 0) {
            gridGlobheight = (gridGlobheight - 200) - $(".fixed-footer").height() - 30;

        } else {

            gridGlobheight = (gridGlobheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 20;
        }

    }

    return gridGlobheight;

}


function gridHeightFunctionDeviceDetail(isPage) {

    var gridheight = $(window).height();
    gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 40;
    $("#" + gID).jqxGrid({ height: gridheight });
    alert(gridheight);

    return gridheight;
}

function setSingleCustomWidth(datafield, gID) {

    var columnWidth = $("#" + gID).jqxGrid('getcolumnproperty', datafield, 'width');
    var columnMinWidth = $("#" + gID).jqxGrid('getcolumnproperty', datafield, 'minwidth');
    alert(columnWidth + "\n" + columnMinWidth);
    //$("#" + gID).jqxGrid('setcolumnproperty', datafield, 'width', columnMinWidth);

}
function displayToaster(toaster, config) {
    var tosterConfiguration = {
        title: config.title,
        msg: config.message,
        pushTo: config.pushTo,
        position: config.position,
        timeout: config.timeOut,
        showClose: config.showClose,
        spinner: true,
        clickToClose: config.clickToClose
    }
    if (config.toasterType == "info") {
        toaster.info(tosterConfiguration);
    } else if (config.toasterType == "success") {
        toaster.success(tosterConfiguration);
    } else if (config.toasterType == "wait") {
        toaster.wait(tosterConfiguration);
    } else if (config.toasterType == "warning") {
        toaster.warning(tosterConfiguration);
    } else if (config.toasterType == "note") {
        toaster.note(tosterConfiguration);
    } else if (config.toasterType == "error") {
        toaster.error(tosterConfiguration);
    }
};

function removeToaster(toaster) {
    toaster.clear();
}
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function replaceValidChars(dateFormat, validatecharcter, charlength, validUnit) {
    var char = '';
    for (var i = 0; i < charlength; i++) {
        char = char + validatecharcter;
    }
    if (dateFormat.indexOf(char) > -1) {
        if (validUnit == 'year') {
            dateFormat = dateFormat.replace(char, 'yyyy');
        } else if (validUnit == 'month') {
            dateFormat = dateFormat.replace(char, 'mm');
        } else if (validUnit == 'day') {
            dateFormat = dateFormat.replace(char, 'dd');
        } else if (validUnit == 'hour') {
            dateFormat = dateFormat.replace(char, 'HH');
        } else if (validUnit == 'minute') {
            dateFormat = dateFormat.replace(char, 'ii');
        } else if (validUnit == 'second') {
            dateFormat = dateFormat.replace(char, 'ss');
        } else if (validUnit == 'meridian') {
            dateFormat = dateFormat.replace(char, 'p');
        }
    } else {
        return AppConstants.get('DEFAULT_DATETIME_FORMAT');
    }

    return dateFormat;
}
function validateDateFormat(Options) {
    // The date format, combination of p, P, h, hh, i, ii, s, ss, d, dd, m, mm, M, MM, yy, yyyy.
    //p : meridian in lower case ('am' or 'pm') - according to locale file
    //P : meridian in upper case ('AM' or 'PM') - according to locale file
    //s : seconds without leading zeros
    //ss : seconds, 2 digits with leading zeros
    //i : minutes without leading zeros
    //ii : minutes, 2 digits with leading zeros
    //h : hour without leading zeros - 24-hour format
    //hh : hour, 2 digits with leading zeros - 24-hour format
    //H : hour without leading zeros - 12-hour format
    //HH : hour, 2 digits with leading zeros - 12-hour format
    //d : day of the month without leading zeros
    //dd : day of the month, 2 digits with leading zeros
    //m : numeric representation of month without leading zeros
    //mm : numeric representation of the month, 2 digits with leading zeros
    //M : short textual representation of a month, three letters
    //MM : full textual representation of a month, such as January or March
    //yy : two digit representation of a year
    //yyyy : full numeric representation of a year, 4 digits

    Options.dateFormat = Options.dateFormat.replaceAll('Y', 'y');
    Options.dateFormat = Options.dateFormat.replaceAll('D', 'd');
    Options.dateFormat = Options.dateFormat.replaceAll('S', 's');
    Options.dateFormat = Options.dateFormat.replaceAll('I', 'i');
    var isYearExist = false;
    var isMonthExist = false;
    var isDayExist = false;
    var isHourExist = false;
    var isMinuteExist = false;
    //Year Validation
    var yearCharCount = Options.dateFormat.split("y").length - 1;
    if (yearCharCount > 0 && yearCharCount != 2 && yearCharCount != 4) {
        Options.dateFormat = replaceValidChars(Options.dateFormat, 'y', yearCharCount, 'year');
        isYearExist = true;
    } else if (yearCharCount > 0 && (yearCharCount == 2 || yearCharCount == 4)) {
        isYearExist = true;
    }
    //Month Validation
    var monthCharCount = Options.dateFormat.split("m").length - 1 > 0 ? Options.dateFormat.split("m").length - 1 : Options.dateFormat.split("M").length - 1;
    if (monthCharCount > 0 && monthCharCount != 1 && monthCharCount != 2) {
        var validateChar = 'm';
        if (Options.dateFormat.split("M").length - 1 > 0) {
            validateChar = 'M'
        }
        Options.dateFormat = replaceValidChars(Options.dateFormat, validateChar, monthCharCount, 'month');
        isMonthExist = true;
    } else if (monthCharCount > 0 && (monthCharCount == 1 || monthCharCount == 2)) {
        isMonthExist = true;
    }

    //Day Validation
    var dayCharCount = Options.dateFormat.split("d").length - 1;
    if (dayCharCount > 0 && dayCharCount != 1 && dayCharCount != 2) {
        Options.dateFormat = replaceValidChars(Options.dateFormat, 'd', dayCharCount, 'day');
        isDayExist = true;
    } else if (dayCharCount > 0 && (dayCharCount == 1 || dayCharCount == 2)) {
        isDayExist = true;
    }
    //Hour Validation
    var hourCharCount = Options.dateFormat.split("h").length - 1 > 0 ? Options.dateFormat.split("h").length - 1 : Options.dateFormat.split("H").length - 1;
    if (hourCharCount > 0 && hourCharCount != 1 && hourCharCount != 2) {
        var validateChar = 'h';
        if (Options.dateFormat.split("H").length - 1 > 0) {
            validateChar = 'H'
        }
        Options.dateFormat = replaceValidChars(Options.dateFormat, validateChar, hourCharCount, 'hour');
        isHourExist = true;
    } else if (hourCharCount > 0 && (hourCharCount == 1 || hourCharCount == 2)) {
        isHourExist = true;
    }

    //Minute Validation
    var minuteCharCount = Options.dateFormat.split("i").length - 1;
    if (minuteCharCount > 0 && minuteCharCount != 1 && minuteCharCount != 2) {
        Options.dateFormat = replaceValidChars(Options.dateFormat, 'i', minuteCharCount, 'minute');
        isMinuteExist = true;
    } else if (minuteCharCount > 0 && (minuteCharCount == 1 || minuteCharCount == 2)) {
        isMinuteExist = true;
    }

    //Seconds Validation
    var secondCharCount = Options.dateFormat.split("s").length - 1;
    if (secondCharCount > 0 && secondCharCount != 1 && secondCharCount != 2) {
        Options.dateFormat = replaceValidChars(Options.dateFormat, 's', secondCharCount, 'second');
    }

    //Meridian Validation
    var meridianCharCount = Options.dateFormat.split("p").length - 1 > 0 ? Options.dateFormat.split("p").length - 1 : Options.dateFormat.split("P").length - 1;
    if (meridianCharCount > 0 && meridianCharCount != 1) {
        var validateChar = 'p';
        if (Options.dateFormat.split("P").length - 1 > 0) {
            validateChar = 'P'
        }
        Options.dateFormat = replaceValidChars(Options.dateFormat, validateChar, meridianCharCount, 'meridian');
    }

    if (isYearExist && !isMonthExist && !isDayExist && !isHourExist && !isMinuteExist) {
        // Only year exist like yyyy or yy
        Options.minView = 'decade';
        Options.startView = 'decade';
    } else if (isYearExist && isMonthExist && !isDayExist && !isHourExist && !isMinuteExist) {
        // Year and month exist like yyyy-mm or yy-m or M-Y or MM-YYYY continues...
        Options.minView = 'year';
        Options.startView = 'year';
    } else if (isYearExist && isMonthExist && isDayExist && !isHourExist && !isMinuteExist) {
        // Year ,month and date exist like dd-mm-yyyy or DD-mm-YYYY or dd/yyyy/mm continues...
        Options.minView = 'month';
        Options.startView = 'month';
    } else if (isYearExist && isMonthExist && isDayExist && isHourExist && !isMinuteExist) {
        // Year ,month , date and hour exist like dd-mm-yyyy HH or DD-mm-YYYY H or dd/yyyy/mm h continues...
        Options.minView = 'day';
        Options.startView = 'month';
    } else if (isYearExist && isMonthExist && isDayExist && isHourExist && isMinuteExist) {
        // Year ,month , date , hour and minutes exist like dd-mm-yyyy HH:ii or DD-mm-YYYY H:i or dd/yyyy/mm h:I continues...
        Options.minView = 'hour';
        Options.startView = 'month';
    } else if (!isYearExist && isMonthExist && !isDayExist && !isHourExist && !isMinuteExist) {
        // only month exist like mm or m or M or MM
        Options.minView = 'year';
        Options.startView = 'year';
        Options.maxView = 'year';
    } else if (!isYearExist && !isMonthExist && isDayExist && !isHourExist && !isMinuteExist) {
        // only day exist like DD or D or d or dd
        Options.minView = 'month';
        Options.startView = 'month';
        Options.maxView = 'month';
    } else if (!isYearExist && !isMonthExist && !isDayExist && isHourExist && !isMinuteExist) {
        // only Hour exist like hh or h or HH or H 
        Options.minView = 'day';
        Options.startView = 'day';
        Options.maxView = 'day';
    } else if (!isYearExist && !isMonthExist && !isDayExist && !isHourExist && isMinuteExist) {
        // only Minutes exist like ii or i or II or I 
        Options.minView = 'hour';
        Options.startView = 'hour';
        Options.maxView = 'hour';
    } else if (!isYearExist && !isMonthExist && !isDayExist && isHourExist && isMinuteExist) {
        // Hours and Minutes exist like hh:ii or h:i or HH:II or H:I 
        Options.minView = 'hour';
        Options.startView = 'day';
        Options.maxView = 'day';
    } else {
        Options.minView = 'hour';
        Options.startView = 'month';
    }
    return Options;
}

function updateDateTimePicker(id, dateFormat, value) {
    var Options = {};
    Options.minView = 'hour';
    Options.startView = 'month';
    Options.dateFormat = dateFormat;
    if (dateFormat == undefined || dateFormat == '') {
        Options.dateFormat = AppConstants.get('DEFAULT_DATETIME_FORMAT');
    } else {
        Options = validateDateFormat(Options);
    }
    if (id == '#fromLogDate' || id == '#toLogDate') {
        if (Options.maxView == undefined || Options.maxView == '') {
            $(id).datetimepicker({
                format: Options.dateFormat,
                autoclose: true,
                todayBtn: true,
                pickerPosition: "bottom-left",
                minView: Options.minView,
                startView: Options.startView,
                endDate: getTodayDate()
            });
        } else {
            $(id).datetimepicker({
                format: Options.dateFormat,
                autoclose: true,
                todayBtn: true,
                pickerPosition: "bottom-left",
                minView: Options.minView,
                startView: Options.startView,
                maxView: Options.maxView,
                endDate: getTodayDate()
            });
        }

    } else {
        if (Options.maxView == undefined || Options.maxView == '') {
            $(id).datetimepicker({
                format: Options.dateFormat,
                autoclose: true,
                todayBtn: true,
                pickerPosition: "bottom-left",
                minView: Options.minView,
                startView: Options.startView,
                startDate: getTodayDate()
            });
        } else {
            $(id).datetimepicker({
                format: Options.dateFormat,
                autoclose: true,
                todayBtn: true,
                pickerPosition: "bottom-left",
                minView: Options.minView,
                startView: Options.startView,
                maxView: Options.maxView,
                startDate: getTodayDate()
            });
        }
    }


    if (value && value != 'today') {
        $(id).datetimepicker('update', value);
    } else if (value == 'today') {
        $(id).datetimepicker('update', getTodayDate());
    }
}
function getTodayDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hours = '' + d.getHours(),
        minutes = '' + d.getMinutes();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;

    return [year, month, day].join('-') + " " + hours + ":" + minutes + ":00";
}

function validateNumberKey(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode === 8 || event.keyCode === 32 || event.keyCode === 46 || event.keyCode === 127) {
        return true;
    } else if (key < 48 || key > 57) {
        return false;
    } else {
        return true;
    }
    return true;
}

function validateName(value) {
    var filter = /^[a-zA-Z0-9]+[a-zA-Z0-9 &,.\-_\']*$/;
    if (filter.test(value)) {
        return true;
    } else {
        return false;
    }
}

function validateFolderName(value) {
    var filter = /[\:*?"<>\\\/|]/gi;
    if (filter.test(value)) {
        return false;
    } else {
        return true;
    }
}

function validateFileName(value) {
    var filter = /[\:*?"<>\\\/|]/gi;
    if (filter.test(value)) {
        return false;
    } else {
        return true;
    }
}

function validateMerchantUserName(value) {
    var filter = /[0-9`~@!#$%^&*()|+\=?;:"<>\{\}\[\]\\\/,_]{1,35}/gi;
    var regExp = /^[A-za-z]/;
    if (filter.test(value)) {
        return false;
    } else {
        if (regExp.test(value))
            return true;
        else
            return false;
    }
}

function validateIsNumber(value) {
    var filter = /[A-za-z`~@!#$%^&*()|+\=?;:"<>\{\}\[\]\\\/._-]{1,100}/gi;
    if (filter.test(value)) {
        return false;
    } else {
        return true;
    }
}

function validateIsCommaExist(value) {
    if (value.indexOf(',') != -1) {
        return true;
    } else {
        return false;
    }
}


function validateIdentifier(value) {
    var filter = /[`~@!#$%^&*()|+\=?;:'",.<>\{\}\[\]\\\/_]{1,100}/gi;
    var regExp = /^[A-za-z0-9]/;
    if (filter.test(value)) {
        return false;
    } else {
        if (regExp.test(value))
            return true;
        else
            return false;
    }
}

function validatePostalCode(value) {
    var filter = /[`~@!#$%^&*()|+\=?;:'",.<>\{\}\[\]\\\/_]/gi;
    var regExp = /^[A-za-z0-9]/;
    if (filter.test(value)) {
        return false;
    } else {
        if (regExp.test(value))
            return true;
        else
            return false;
    }
}

function validateUSNumber(event) {
    var regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return regex.test($(event.target).val());
}

function validateEmail(value) {
    var filter = /^([\w-\.]+)@(?![vV][eE][rR][iI][fF][oO][nN][eE]\.[cC][oO][mM])((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    if (filter.test(value)) {
        return true;
    } else {
        return false;
    }
}

function validateWebsite(value) {

    var filter = /^(http\:\/\/|https\:\/\/)?((([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5]))|(([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+([a-zA-Z0-9\-]*\.)*[a-zA-Z]+))$/;
    if (filter.test(value)) {
        return true;
    } else {
        return false;
    }
}

function getArrayIndexForKey(arr, key, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][key] == val)
            return i;
    }
    return -1;
}

//#Schedule Actions/jobs/content - Enable/Disble the Up/Down Arrows to change order of packages----
function enableDisableUpDownArrows(selectedArrayForSwap, lastIndex, moveUpId, moveDownId) {

    //#Disable Up/Down Arrows when selection is not continuous.
    var sortedselectedRowArrayForSwap = _.sortBy(selectedArrayForSwap, 'SelectedArrayIndex');
    var currentIndex = 0;
    var previousIndex = 0;
    for (var i = 0; i < sortedselectedRowArrayForSwap.length; i++) {
        currentIndex = sortedselectedRowArrayForSwap[i].SelectedArrayIndex;
        if (i > 0)
            previousIndex = sortedselectedRowArrayForSwap[i - 1].SelectedArrayIndex;

        if (i == 0 || (currentIndex - previousIndex) == 1) {
            continue;
        }
        else {
            $(moveUpId).addClass('disabled');
            $(moveDownId).addClass('disabled');
            return;
        }
    }

    //#Disable/Enable Up/Down Arrows when First/Last row/s selected.
    var isZeroIndexChecked = getArrayIndexForKey(selectedArrayForSwap, 'SelectedArrayIndex', 0) == -1 ? false : true;
    var isLastIndexChecked = getArrayIndexForKey(selectedArrayForSwap, 'SelectedArrayIndex', lastIndex) == -1 ? false : true;

    if (isZeroIndexChecked && isLastIndexChecked) {
        $(moveDownId).addClass('disabled');
        $(moveUpId).addClass('disabled');
    }
    else if (isZeroIndexChecked && !isLastIndexChecked) {
        $(moveUpId).addClass('disabled');
        $(moveDownId).removeClass('disabled');
    }
    else if (!isZeroIndexChecked && isLastIndexChecked) {
        $(moveUpId).removeClass('disabled');
        $(moveDownId).addClass('disabled');
    }
    else {
        $(moveUpId).removeClass('disabled');
        $(moveDownId).removeClass('disabled');
    }
}


//#PopUp buttons - Enable/Disble the Up/Down Arrows
function enableDisableUpDownArrowsInPopUp(selectedArrayForSwap, lastIndex, moveUpId, moveDownId) {
    //#Disable Up/Down Arrows when selection is not continuous.
    var sortedselectedRowArrayForSwap = _.sortBy(selectedArrayForSwap, 'SelectedArrayIndex');
    var currentIndex = 0;
    var previousIndex = 0;
    for (var i = 0; i < sortedselectedRowArrayForSwap.length; i++) {
        currentIndex = sortedselectedRowArrayForSwap[i].SelectedArrayIndex;
        if (i > 0)
            previousIndex = sortedselectedRowArrayForSwap[i - 1].SelectedArrayIndex;

        if (i == 0 || (currentIndex - previousIndex) == 1) {
            continue;
        }
        else {
            $(moveDownId).addClass('disabled');
            $(moveUpId).addClass('disabled');
            $(moveUpId).prop("disabled", true);
            $(moveDownId).prop("disabled", true);
            return;
        }
    }

    //#Disable/Enable Up/Down Arrows when First/Last row/s selected.
    var isZeroIndexChecked = getArrayIndexForKey(selectedArrayForSwap, 'SelectedArrayIndex', 0) == -1 ? false : true;
    var isLastIndexChecked = getArrayIndexForKey(selectedArrayForSwap, 'SelectedArrayIndex', lastIndex) == -1 ? false : true;

    if (isZeroIndexChecked && isLastIndexChecked) {
        $(moveDownId).addClass('disabled');
        $(moveUpId).addClass('disabled');
        $(moveUpId).prop("disabled", true);
        $(moveDownId).prop("disabled", true);
    }
    else if (isZeroIndexChecked && !isLastIndexChecked) {
        $(moveUpId).addClass('disabled');
        $(moveUpId).prop("disabled", true);
        $(moveDownId).removeClass('disabled');
        $(moveDownId).prop("disabled", false);
    }
    else if (!isZeroIndexChecked && isLastIndexChecked) {
        $(moveUpId).removeClass('disabled');
        $(moveUpId).prop("disabled", false);
        $(moveDownId).addClass('disabled');
        $(moveDownId).prop("disabled", false);
    }
    else {
        $(moveDownId).removeClass('disabled');
        $(moveUpId).removeClass('disabled');
        $(moveUpId).prop("disabled", false);
        $(moveDownId).prop("disabled", false);
    }
}


//----- Replacing IP address by the domain name in the Download File URL
function replaceIpAddressByHostName(fileUrl) {
    var ipRegExpn = AppConstants.get('IP_ADDRESS_REG_EXPRESSION');
    var replacedFileUrl = "";
    var isIpAddress = fileUrl.match(ipRegExpn);
    if (isIpAddress && hostName)
        replacedFileUrl = fileUrl.replace(isIpAddress, hostName);
    else
        replacedFileUrl = fileUrl;

    return replacedFileUrl;
}

function getNestedObject(theObject, property, value) {
    var result = null;
    if (theObject instanceof Array) {
        for (var i = 0; i < theObject.length; i++) {
            result = getNestedObject(theObject[i], property, value);
            if (!_.isEmpty(result)) {
                return result;
            }
        }
    }
    else {
        for (var prop in theObject) {
            if (prop == property) {
                if (theObject[prop] == value) {
                    return theObject;
                }
            }
            if (theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
                result = getNestedObject(theObject[prop], property, value);
                if (!_.isEmpty(result)) {
                    return result;
                }
            }
        }
    }
    return result;
}
function redirectToLocation(menuJsonData, id) {
    var menuOption = getNestedObject(menuJsonData, 'id', id);
    if (!_.isEmpty(menuOption) && menuOption.subChildChildern != undefined && menuOption.subChildChildern.length <= 0) {
        window.location.hash = menuOption.parentId + "/" + menuOption.controlerId + "/" + menuOption.id + "/" + menuOption.childParentId;
    } else {
        window.location.hash = menuOption.parentId + "/" + menuOption.controlerId + "/" + menuOption.id;
    }
    if (id == "scheduleDownload") {
        isDownloadScheduleScreenLoaded = true;
    }
    else if (id == "scheduleActions") {
        isActionScheduleScreenLoaded = true;
    }
    else if (id == "scheduleDelivery") {
        isContentScheduleScreenLoaded = true;
    }
}

function showMoreMessageLogs(contentType, message) {
    var errmsg = '';
    if (contentType == 'vpdx') {
        errmsg = i18n.t('invalid_vpdx_format');
    } else if (contentType == 'vpfx') {
        errmsg = i18n.t('invalid_vpfx_format');
    } else if (contentType == 'package') {		//for master package only
        errmsg = i18n.t('invalid_master_package');
    } else if (contentType == 'masterPackage') {  // master package generic error
        errmsg = i18n.t('unable_to_upload_package');
    } else {
        errmsg = i18n.t('invalid_format_found_in_selected_file');
    }
    isMoreInfoDisplayed = false;
    $("#DetailedInformationPopup").modal("show");
    $("#infoApplicationMessage").text(errmsg);
    $("#infoMarkMessage").text(i18n.t('more_details'));
    $("#showMoreErrorInfo").hide();
    if (message) {
        $("#infoMoreMessage").text(message);
    }
}

function getContentTypeFromExtension(extension) {
    contentType = "*/*";
    if (extension == "jpeg" || extension == "jpg") {
        contentType = "image/jpeg";
    } else if (extension == "csv") {
        contentType = "text/csv";
    } else if (extension == "doc") {
        contentType = "application/msword";
    } else if (extension == "gif") {
        contentType = "image/gif";
    } else if (extension == "htm" || extension == "html") {
        contentType = "text/html";
    } else if (extension == "json") {
        contentType = "application/json";
    } else if (extension == "mpeg") {
        contentType = "video/mpeg";
    } else if (extension == "png") {
        contentType = "image/png";
    } else if (extension == "pdf") {
        contentType = "application/pdf";
    } else if (extension == "ppt") {
        contentType = "application/vnd.ms-powerpoint";
    } else if (extension == "rtf") {
        contentType = "application/rtf";
    } else if (extension == "tif" || extension == "tiff") {
        contentType = "image/tiff";
    } else if (extension == "xls" || extension == "xlsx") {
        contentType = "application/vnd.ms-excel application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else if (extension == "3gp") {
        contentType = "video/3gpp audio/3gpp";
    } else if (extension == "zip") {
        contentType = "application/zip";
    } else if (extension == "avi") {
        contentType = "video/x-msvideo";
    } else {
        contentType = "*/*";
    }
    return contentType;
}

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

function saveFileOnAccessDenied(fileNameToSaveAs, blobFile) {
    /* Saves a text string as a blob file*/
    var ie = navigator.userAgent.match(/MSIE\s([\d.]+)/),
        ie11 = navigator.userAgent.match(/Trident\/7.0/) && navigator.userAgent.match(/rv:11/),
        ieEDGE = navigator.userAgent.match(/Edge/g),
        ieVer = (ie ? ie[1] : (ie11 ? 11 : (ieEDGE ? 12 : -1)));

    if (ie && ieVer < 10) {
        console.log("No blobs on IE ver<10");
        return;
    }

    if (ieVer > -1) {
        window.navigator.msSaveBlob(blobFile, fileNameToSaveAs);

    } else {
        var downloadLink = document.createElement("a");
        downloadLink.download = fileNameToSaveAs;
        downloadLink.href = window.URL.createObjectURL(blobFile);
        downloadLink.onclick = function (e) { document.body.removeChild(e.target); };
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
    }
}

function isTabKeyPressed(id) {
    $(id).keydown(function (e) {
        if ((e.which || e.keyCode) == 9)
            e.preventDefault();
    });
}