define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "utility", "appEnum", "AppConstants"], function (ko) {

    licenseDeatailArray = new Array();
    deviceCount = new Object();
    countInfo = new Object();
    var lang = getSysLang();

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function licenseViewModel() {

        var self = this;
        getCustomerLicenseDetails();
        setMenuSelection();

        function getCustomerLicenseDetails() {
            var licenseData = new Object();
            var licenseDetails = new Array();
            
            if (!_.isEmpty(licenseInfo) && licenseInfo.licensedFeatures && licenseInfo.licensedFeatures.length > 0) {
                var indexBasicAlerts = licenseInfo.licensedFeatures.indexOf(AppConstants.get('LICENSE_FEATURE_BASICALERTS'));
                var indexAdvancedAlerts = licenseInfo.licensedFeatures.indexOf(AppConstants.get('LICENSE_FEATURE_ADVANCEDALERTS'));

                if (indexBasicAlerts > -1) {
                    licenseInfo.licensedFeatures[indexBasicAlerts] = AppConstants.get('LICENSE_FEATURE_BASIC_ALERTS');
                } else if (indexAdvancedAlerts > -1) {
                    licenseInfo.licensedFeatures[indexAdvancedAlerts] = AppConstants.get('LICENSE_FEATURE_ALERTS');
                }

                //CustomerGUID
                licenseData.Key = i18n.t('customer_guid', { lng: lang });
                licenseData.Value = '<b>' + licenseInfo.customerGUID.toUpperCase() + '</b>';
                licenseDetails.push(licenseData);

                //License Bundle
                licenseData = new Object();
                licenseData.Key = i18n.t('license_bundle', { lng: lang });
                licenseData.Value = '<b>' + licenseInfo.LicenseBundle + '</b>';
                licenseDetails.push(licenseData);

                //Licensed Features
                licenseData = new Object();
                licenseData.Key = i18n.t('licensed_features', { lng: lang });
                var features = '';
                for (var index = 0; index < licenseInfo.licensedFeatures.length; index++) {
                    features = features + '<tr><td style="padding-left:2px;padding-bottom:5px"><b>' + (index + 1) + '. ' + licenseInfo.licensedFeatures[index] + '\n' + '</b></td></tr>';
                }
                var rowData = '<div><table>' + features + '</table></div>';
                licenseData.Value = rowData;
                licenseDetails.push(licenseData);

                //Number of Devices
                licenseData = new Object();
                licenseData.Key = i18n.t('number_of_devices_licensed', { lng: lang });
                licenseData.Value = '<div><table><tr><td style="padding-left:2px"><b>' + i18n.t('licensed_number_of_devices', { lng: lang }) + '</b></td><td style="padding-left:2px"> : </td><td style="padding-left:2px"><b>' + licenseInfo.licensedDeviceCount + '</b></td></tr><tr><td style="padding-left:2px"><b>' + i18n.t('current_devices', { lng: lang }) + '</b></td><td style="padding-left:2px"> : </td><td style="padding-left:2px"><b> ' + licenseInfo.numberOfDeviceCount + '</b></td></tr></table></div>';
                licenseDetails.push(licenseData);

                //License Validity
                licenseData = new Object();
                licenseData.Key = i18n.t('validity', { lng: lang });
                licenseData.Value = '<b>' + i18n.t('till', { lng: lang }) + " " + licenseInfo.licenseExpiryDate + '</b>';
                licenseDetails.push(licenseData);
            }
            licenseDetailsGrid('jqxgridLincenseDetails', licenseDetails);
        }

        function licenseDetailsGrid(gID, data) {

            var source =
            {
                dataType: "json",
                dataFields: [

                    { name: 'Key', map: 'Key' },
                    { name: 'Value', map: 'Value' }
                ],
                localData: data,
                contentType: 'application/json',
            };

            var keyRenderer = function (row, datafield, value) {
                return '<div style="margin: 5px 10px 5px 10px">' + value + '</div>';
            }

            var dataAdapter = new $.jqx.dataAdapter(source);

            $("#" + gID).jqxGrid(
                {
                    width: "594px",
                    source: dataAdapter,
                    altRows: true,
                    autoheight: true,
                    sortable: false,
                    filterable: false,
                    enablehover: false,
                    autorowheight: true,
                    showheader: false,
                    columnsResize: false,
                    columnsreorder: false,
                    selectionmode: 'none',
                    enabletooltips: false,
                    autoshowfiltericon: true,
                    showsortmenuitems: false,
                    autoshowcolumnsmenubutton: false,
                    columns: [
                        {
                            dataField: 'Key', editable: false, minwidth: 220, maxwidth: 200,
                            cellsalign: 'left', cellsrenderer: keyRenderer
                        },
                        {
                            dataField: 'Value', editable: false, minwidth: 394, maxwidth: 394,
                            cellsalign: 'left'
                        },
                    ]
                });
        }

        seti18nResourceData(document, resourceStorage);

    };

});


