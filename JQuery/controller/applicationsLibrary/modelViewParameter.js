define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, koUtil, autho) {
    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function AddpackageViewModel() {


        paramDataArray = new Array();

        tabContainer = new Array();

        paramLevel = 0;

        DeviceParamAppGID = '';
        if (APPGridIdForTemplate == 0) {
            DeviceParamAppGID = '';
        } else {
            DeviceParamAppGID = APPGridIdForTemplate;
        }

        


        mainContainer = new Array();

       

        var self = this;

        //Draggable function
        $('#mdlViewParamHeader').mouseup(function () {
            $("#mdlViewParameter").draggable({ disabled: true });
        });

        $('#mdlViewParamHeader').mousedown(function () {
            $("#mdlViewParameter").draggable({ disabled: false });
        });
        /////////

        self.templateXML = ko.observable();
        var retvalForBasicParamView = false;
        var retvalForAdvParamView = false;
        var retvalForBasicParamEdit = false;
        var retvalForAdvParamEdit = false;

        checkRights();

        selectedviesion = rowdata.ApplicationVersion;
        selectedApplicationName = rowdata.ApplicationName;
        var msg = i18n.t('parameter_defination_for_application', { lng: lang }) + " " + selectedApplicationName + " " + i18n.t('Version_packageUpgrade', { lng: lang }) + " " + selectedviesion;
        $("#viewparamHead").text(msg);
        var PDXFile = $("#jqxgridApplications").jqxGrid('getcellvalue', selectedRowIndex, 'PDXFile');
        var str = '';
        if (checkForbrowsFile == 0) {
            
            getPDFForApplication(selectedApplicationId, self.templateXML);
        } else {
           
            browsPDFForApplication(self.templateXML);
        }

        //Tab Left and Right arrow Navigation 
        var left = 0;
        var contrWidth = 0;
        self.moveLeft = function () {
			contrWidth = $('#resultSectionViewParameter').width();        //When we move left
            left = moveTabsLeft("#templateTabs", "#moveLeft", "#moveRight", self.templateXML().length, left, contrWidth);
        }

        self.moveRight = function () {
			contrWidth = $('#resultSectionViewParameter').width();        //When we move right
            left = moveTabsRight("#templateTabs", "#moveLeft", "#moveRight", self.templateXML().length, left, contrWidth);
        }

        function checkRights() {
            retvalForBasicParamView = autho.checkRightsBYScreen('Basic Parameter Management', 'IsviewAllowed');
            retvalForAdvParamView = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsviewAllowed');
            retvalForBasicParamEdit = autho.checkRightsBYScreen('Basic Parameter Management', 'IsModifyAllowed');
            retvalForAdvParamEdit = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsModifyAllowed');
        }

        function browsPDFForApplication(templateXML) {

            var browsTemplateXML = koUtil.vpfPDXUploadedDataArr[0];
            var JsonXmlData1 = $.xml2json(browsTemplateXML);

            var MainContainer = new Array();
            var arr = new Array();
            if (JsonXmlData1.length == undefined) {
                JsonXmlData1 = $.makeArray(JsonXmlData1);
            } else {

            }

            for (var i = 0; i < JsonXmlData1.length; i++) {
                if (JsonXmlData1[i].ParameterFile.length == undefined) {
                    JsonXmlData1[i].ParameterFile = $.makeArray(JsonXmlData1[i].ParameterFile);
                } else {

                }

                for (var j = 0; j < JsonXmlData1[i].ParameterFile.length; j++) {
                    //MainContainer.push(CreateMainContainer(JsonXmlData1[i].ParameterFile[j]));

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
                contrWidth = $('#resultSectionViewParameter').width();
                left = 0;
                updateTabsNavigation("#templateTabs", "#moveLeft", "#moveRight", tabContainer.length, left, contrWidth);
            }, 500);

        }

        function getPDFForApplication(applicationId, templateXML) {

            var getPDFForApplicationReq = new Object();
            getPDFForApplicationReq.ApplicationId = applicationId;
            getPDFForApplicationReq.State = 0;//ENUM.get('Active');
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.getPDFForApplicationResp)
                            data.getPDFForApplicationResp = $.parseJSON(data.getPDFForApplicationResp);

                        if (data.getPDFForApplicationResp.ParamDefFile) {                          
                            koUtil.editDevicetemplateXML = data.getPDFForApplicationResp.ParamDefFile;
                            var JsonXmlData1 = $.xml2json(koUtil.editDevicetemplateXML);

                            var MainContainer = new Array();
                            var arr = new Array();
                            if (JsonXmlData1.length == undefined) {
                                JsonXmlData1 = $.makeArray(JsonXmlData1);
                            } else {

                            }

                            for (var i = 0; i < JsonXmlData1.length; i++) {
                                if (JsonXmlData1[i].ParameterFile.length == undefined) {
                                    JsonXmlData1[i].ParameterFile = $.makeArray(JsonXmlData1[i].ParameterFile);
                                } else {

                                }

                                //for (var j = 0; j < JsonXmlData1[i].ParameterFile.length; j++) {
                                //    MainContainer.push(CreateMainContainer(JsonXmlData1[i].ParameterFile[j]));

                                //}
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
                                contrWidth = $('#resultSectionViewParameter').width();
                                left = 0;
                                updateTabsNavigation("#templateTabs", "#moveLeft", "#moveRight", tabContainer.length, left, contrWidth);
                            }, 500);
                            

                            //check file us uploaded or not
                            //if (vpfPDXFlag == 1) {
                            //    if (koUtil.vpfPDXUploadedDataArr.length != 0) {
                            //        showparamlink(koUtil.vpfPDXUploadedDataArr);
                            //    } else {
                            //        showparamlink(data.getPDFForApplicationResp.ParamDefFile);
                            //    }
                            //} else {
                            //    showparamlink(koUtil.vpfPDXUploadedDataArr);
                            //}
                        } else {
                            //showparamlink(koUtil.vpfPDXUploadedDataArr);
                        }
                    } 
                }
            }

            var params = '{"token":"' + TOKEN() + '","getPDFForApplicationReq":' + JSON.stringify(getPDFForApplicationReq) + '}'
            ajaxJsonCall('GetPDFForApplication', params, callBackfunction, true, 'POST', true);

        }

        function showparamlink(dataArr) {
            var PDFFData = new Array();
            if (dataArr != null) {
                if (vpfPDXFlag == 1) {
                    if (koUtil.vpfPDXUploadedDataArr.length != 0) {
                        var xml = dataArr[0];
                    } else {
                        var xml = dataArr;
                    }

                } else {
                    var xml = dataArr[0];
                }

                if (xml != "") {
                    var JsonXmlData = $.xml2json(xml);
                    var containerArr = JsonXmlData.ParameterFile.Container;
                    var count = 0;
                    for (var i = 0; i < containerArr.length; i++) {
                        count = count + 1;
                        var parentObj = new Object();
                        parentObj.Name = containerArr[i].Name;
                        parentObj.Default = '';
                        parentObj.ParentId = null;
                        parentObj.ID = count;
                        PDFFData.push(parentObj);

                        for (var k = 0; k < containerArr[i].Param.length; k++) {
                            count = count + 1;
                            var childObj = new Object();
                            childObj.Name = containerArr[i].Param[k].Name;
                            childObj.Default = containerArr[i].Param[k].Default;
                            childObj.ParentId = parentObj.ID;
                            childObj.ID = count;
                            PDFFData.push(childObj);
                        }

                    }
                } else {

                    PDFFData = [];
                }
            } else {

                PDFFData = [];
            }

            generatePDATreeGrid(PDFFData);
        }


        function generatePDATreeGrid(PDFFData) {
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
            $("#ViewPDXTreeGrid").jqxTreeGrid(
            {
                width: '100%',
                height: '300px',
                source: dataAdapter,
                sortable: true,
                columnsResize: true,
                columnsReorder: true,
                selectionMode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                //rowsheight: 32,
                filterable: false,
                sortable: false,
                ready: function () {
                    for (var i = 0; i < PDFFData.length; i++) {
                        $("#ViewPDXTreeGrid").jqxTreeGrid('expandRow', PDFFData[i].ID);
                    }
                },
                columns: [
                  { text: i18n.t('parameter_name', { lng: lang }), dataField: 'Name', minwidth: 365, width: 'auto' },
                  { text: i18n.t('default_value_for_view', { lng: lang }), dataField: 'Default', minwidth: 365, width: 'auto' },
                ]

            });

        }
        ////

        seti18nResourceData(document, resourceStorage);
    };



});

