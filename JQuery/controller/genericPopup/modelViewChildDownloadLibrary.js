define(["knockout", "autho", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, autho, koUtil) {
    return function appViewModel() {

        paramDataArray = new Array();

        tabContainer = new Array();

        paramLevel = 0;

        DeviceParamAppGID = '';
        //if (APPGridIdForTemplate == 0) {
        //    DeviceParamAppGID = '';
        //} else {
        //    DeviceParamAppGID = APPGridIdForTemplate;
        //}

        var self = this;

        var retvalForBasicParamView = false;
        var retvalForAdvParamView = false;
        var retvalForBasicParamEdit = false;
        var retvalForAdvParamEdit = false;

        self.templateXML = ko.observable();

        //Tab Left and Right arrow Navigation 
        var left = 0;
        var contrWidth = 0;
        self.moveLeft = function () {
			contrWidth = $('#resultSectionViewApplicationParameters').width();        //When we move left
            left = moveTabsLeft("#templateTabs", "#moveDLLeft", "#moveDLRight", self.templateXML().length, left, contrWidth);
        }

        self.moveRight = function () {
			contrWidth = $('#resultSectionViewApplicationParameters').width();        //When we move right
            left = moveTabsRight("#templateTabs", "#moveDLLeft", "#moveDLRight", self.templateXML().length, left, contrWidth);
        }

        checkRights();

        function checkRights() {
            retvalForBasicParamView = autho.checkRightsBYScreen('Basic Parameter Management', 'IsviewAllowed');
            retvalForAdvParamView = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsviewAllowed');
            retvalForBasicParamEdit = autho.checkRightsBYScreen('Basic Parameter Management', 'IsModifyAllowed');
            retvalForAdvParamEdit = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsModifyAllowed');
        }

        var row = koUtil.rowIdDownload;
        var grid = koUtil.gridIdDownloadChild;

       

            var applicationID = koUtil.applicationIDAppChild;
            var applicationName = koUtil.applicationNameAppChild;
            var applicationVersion = koUtil.applicationVersionAppChild;
            //var isParameterizationEnabled = $(grid).jqxGrid('getcellvalue', row, 'IsParameterizationEnabled');

            $("#parameterHeading").text(i18n.t('pramater_definition_for_application', { applicationName: applicationName, applicationVersion: applicationVersion }, { lng: lang }));

            ChildAplicationViewPopup1(row, applicationID, grid, applicationName, applicationVersion, self.templateXML);
        

            $('#modelViewChildDownlaodLibHeader').mouseup(function () {
                $("#modelViewChildDownlaodLib").draggable({ disabled: true });
            });

            $('#modelViewChildDownlaodLibHeader').mousedown(function () {
                $("#modelViewChildDownlaodLib").draggable({ disabled: false });
            });




        function ChildAplicationViewPopup1(row, applicationID, gID, applicationName, applicationVersion,templateXML) {
            $("#parameterHeading").text(i18n.t('pramater_definition_for_application', { applicationName: applicationName, applicationVersion: applicationVersion }, { lng: lang }));
           // $('#childApplicationView').modal('show');
            var getPDFForApplicationReq = new Object();
            getPDFForApplicationReq.ApplicationId = applicationID;
            getPDFForApplicationReq.State = 0;
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        var PDFFData = new Array();
                        if (data.getPDFForApplicationResp)
                            data.getPDFForApplicationResp = $.parseJSON(data.getPDFForApplicationResp);
                        if (data.getPDFForApplicationResp.ParamDefFile) {
                            var xml = data.getPDFForApplicationResp.ParamDefFile;
                            var JsonXmlData1 = $.xml2json(xml);
                            if (JsonXmlData1.length == undefined) {
                                JsonXmlData1 = $.makeArray(JsonXmlData1);
                            } 
                            for (var i = 0; i < JsonXmlData1.length; i++) {
                                if (JsonXmlData1[i].ParameterFile.length == undefined) {
                                    JsonXmlData1[i].ParameterFile = $.makeArray(JsonXmlData1[i].ParameterFile);
                                }                                
                                for (var j = 0; j < JsonXmlData1[i].ParameterFile.length; j++) {

                                    if (JsonXmlData1[i].ParameterFile[j].Container.length == undefined) {

                                        JsonXmlData1[i].ParameterFile[j].Container = $.makeArray(JsonXmlData1[i].ParameterFile[j].Container);

                                    }
                                    for (var t = 0; t < JsonXmlData1[i].ParameterFile[j].Container.length; t++) {
                                        paramLevel = 0;
                                        GenerateContainerData(JsonXmlData1[i].ParameterFile[j].Container[t], tabContainer, paramLevel, DeviceParamAppGID, undefined, 1, true, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, !koUtil.isDeviceProfile(), koUtil, false);
                                    }
                                }
                            }
                          
                            $("#templateTabs").css("width", tabContainer.length * 110 + "px");
                            templateXML(tabContainer);
                            setTimeout(function () {
                                contrWidth = $('#resultSectionViewApplicationParameters').width();
                                left = 0;
                                updateTabsNavigation("#templateTabs", "#moveDLLeft", "#moveDLRight", tabContainer.length, left, contrWidth);
                            }, 500);
                            
                        } 
                    } 
                }
            }
            var method = 'GetPDFForApplication';
            var params = '{"token":"' + TOKEN() + '","getPDFForApplicationReq":' + JSON.stringify(getPDFForApplicationReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);

        }

        function generatePDATreeGrid(PDFFData, containerArr) {
            // prepare the data
            var source =
            {
                dataType: "json",
                dataFields: [
                    { name: 'ID', type: 'number' },
                    { name: 'ParentId', type: 'number' },
                    { name: 'Name', type: 'string' },
                    { name: 'Default', type: 'string' },

                ],
                hierarchy:
                {
                    keyDataField: { name: 'ID' },
                    parentDataField: { name: 'ParentId' }
                },
                id: 'ID',
                localData: PDFFData
            };
            var dataAdapter = new $.jqx.dataAdapter(source);
            // create Tree Grid
            $("#jqxgridViewChilDownloadLib").jqxTreeGrid(
            {
                width: 648,
                source: dataAdapter,
                sortable: true,
                columnsResize: true,
                columnsReorder: true,
                selectionMode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                filterable: false,
                ready: function () {
                    for (var i = 0; i < PDFFData.length; i++) {
                        $("#jqxgridViewChilDownloadLib").jqxTreeGrid('expandRow', PDFFData[i].ID);
                    }
                },
                columns: [
                  { text: 'Parameter Name', dataField: 'Name', minwidth: 323, width: 323 },
                  { text: 'Default Value', dataField: 'Default', minwidth: 323, width: 323 },
                ]

            });
        }
        seti18nResourceData(document, resourceStorage);
    };

    function generateTemplate(tempname, controllerId) {
        //new template code
        var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
        var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';
        ko.components.register(tempname, {
            viewModel: { require: ViewName },
            template: { require: 'plugin/text!' + htmlName }
        });
        // end new template code
    }

});