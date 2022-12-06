define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil) {

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function GroupAssignedViewModel() {
  
        var self = this;
        if (koUtil.deviceProfileGroup) {
            var deviceProfileGroupGrid = koUtil.deviceProfileGroup;
            jqxgridDeviceProfGroupAssign(deviceProfileGroupGrid, 'jqxgridDeviceProfileGroupAssign');
        } else {
            var deviceProfileGroupGrid = [];
            jqxgridDeviceProfGroupAssign(deviceProfileGroupGrid, 'jqxgridDeviceProfileGroupAssign');
        }
        //open popup
        self.templateFlag = ko.observable(false);
        self.observableModelPopup = ko.observable();
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');

        //Clear Filter
        self.clearfilter = function (gId) {
            clearUiGridFilter(gId);
        }

        //Export to excel
        self.exportToExcel = function (gID, data) {
            var dataInfo = $("#" + gID).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#loadingDiv").show();
                exportjqxcsvData(gID,'Groups'); 
               openAlertpopup(1, 'export_Information');
                $("#loadingDiv").hide();
            }


        }

        function jqxgridDeviceProfGroupAssign(deviceProfileGroupGrid, gID) {
           
            // prepare the data
            var source =
            {
                datatype: "json",
                localdata: deviceProfileGroupGrid,
                datafields: [
                     { name: 'GroupName', map: 'GroupName', type: 'string' },
                ],
             
                contentType: 'application/json',
            };
            var dataAdapter = new $.jqx.dataAdapter(source, {
                downloadComplete: function (data, status, xhr) {
                },
                loadError: function (jqXHR, status, error) {
                   
                }

            });

            var buildFilterPanel = function (filterPanel, datafield) {
                wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
            }


            // create jqxgrid.
            $("#" + gID).jqxGrid(
            {
                width: "100%",
                source: dataAdapter,
                sortable: true,
                filterable: true,
                columnsResize: true,
                columnsreorder: false,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                showsortmenuitems: false,
                rowsheight: 32,
                enabletooltips: true,
                altrows: true,
                ready: function () {
                    var columns = genericHideShowColumn(gID, true, ['results']);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;

                    var gridheight = $(window).height();
                    gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 50;
                    $("#" + gID).jqxGrid({ height: gridheight });
                },
                columns: [

                    {
                        text: i18n.t('Group_Name_headertext', { lng: lang }), datafield: 'GroupName', minwidth: 100,  enabletooltips: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        },

                    },
                ]
            })

        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
                self.observableModelPopup(elementname);
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