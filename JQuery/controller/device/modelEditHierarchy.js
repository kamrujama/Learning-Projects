define(["knockout"], function (ko) {
    globaleHirarchyPath = new Array();
    globaleHirarchyPathArray = new Array();
    $("#loadingDiv").hide();

    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function AddpackageViewModel() {
       
        var self = this;
       
        self.visibleSetBtn = ko.observable();
        self.visibleokBtn = ko.observable();
        self.heirarchyPath = ko.observable();

        if (heirarchyGlobalCheck == 1) {
            self.visibleSetBtn(false);
            self.visibleokBtn(true);
        } else {
            self.visibleSetBtn(true);
            self.visibleokBtn(false);
        }
        self.SetHierarchy = function (gId) {
            isHierarchyChange = true;
            $('#saveBtn').removeAttr('disabled');
            $('#addBtn').removeAttr('disabled');
            if (hierarchyforuser == 1) {
                $("#levelUser").val(globaleHirarchyParent);
                var path = '';
                for (var j = 0; j < globaleHirarchyPath.length; j++) {
                    path += globaleHirarchyPath[j].trim() + ' >>';
                }
                path = path.substring(0, path.length - 2)
                $("#valueHierarchy").val(globaleUserHirarchy);
                $('#deviceModel').modal('hide');
                globaleHirarchyPath = [];
                globaleHirarchyParent = '';
                self.GetHierarchyLevels(null);
                self.GetHierarchyLevels(heirarchyData);
            } else if (hierarchyforAddDevice == 2) {
                var path = '';
                for (var j = 0; j < globaleHirarchyPath.length; j++) {
                    path += globaleHirarchyPath[j].trim() + ' >>';
                }
                path = path.substring(0, path.length - 2)
                $("#valueHierarchy").val(globaleUserHirarchy);
                $('#deviceModel').modal('hide');
                globaleHirarchyPath = [];
                globaleHirarchyParent = '';
                self.GetHierarchyLevels(null);
                self.GetHierarchyLevels(heirarchyData);
            } else {

                selectedIds = getSelectedUniqueId(gId)
                UpdateDeviceheirarchy(selectedIds, selectedHierarchyID, gId);
                self.GetHierarchyLevels(null);
                self.GetHierarchyLevels(heirarchyData);
                if (heirarchyGlobalCheck == 1) {
                    $("#advanceSearchdeviceModel").modal('hide');
                } else {
                    $("#deviceModel").modal('hide');
                }
            }
        }
        self.cancelHierarchy = function () {
            self.GetHierarchyLevels(null);
            self.GetHierarchyLevels(heirarchyData);
            if (heirarchyGlobalCheck == 1) {
                $("#advanceSearchdeviceModel").modal('hide');
            } else {
                $("#deviceModel").modal('hide');
            }
           
        }
        self.GetHierarchyLevels = ko.observable();
        self.GetHierarchyLevels(heirarchyData);

        self.goToHeirarchy = function (index) {
          
            index = index + 1;
            selectedHierarchyID = $("#mainhierarchyid").text();
            var id = '#' + index + 'ul';
            var seltextpath = $("#parentHeirarchy").text();
            globaleUserHirarchy = seltextpath;
            globaleHirarchyParent = $("#parLevel1").parent('div').prev('div').text();
            globaleHirarchyPath = [];
            globaleHirarchyPath.push(seltextpath);
            selectParan();
            GetHierarchies(0, index, id);

        }
        self.addHierarchy = function (heirarchyData) {

           
            var path = '';
            for (var i = 0; i < globaleHirarchyPath.length; i++) {
                if (i != 0) {
                    path += '>>';
                }
                    path+=globaleHirarchyPath[i];
                
            }
            var pathobj = new Object();
            pathobj.path = path;
            globaleHirarchyPathArray.push(pathobj);
           
            heirarchyData(globaleHirarchyPathArray);
            if (heirarchyGlobalCheck == 1) {
                $("#advanceSearchdeviceModel").modal('hide');
            } else {
                $("#deviceModel").modal('hide');
            }
        }
        seti18nResourceData(document, resourceStorage);
    }

    function bindGrid(gId) {
        gridFilterClear(gId);
    }
    function selectParan() {
        $("#parLevel1").addClass('selected');
    }

    function getSelectedIds() {
        return SelectedIdOnGlobale;
        
    }

    function GetHierarchies(id, index, selectorid) {
        var hierarchy = new Object();
        hierarchy.Id = id;

        var responsefunction = function (data, error) {
            if (data) {
                if (data.hierarchyList)
                    data.hierarchyList = $.parseJSON(data.hierarchyList);
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    var str = '';
                    var heirarchyArray = data.hierarchyList;
                    for (var i = 0; i < heirarchyArray.length; i++) {
                        str += '<li id="' + index + heirarchyArray[i].Id + 'li" onclick="goToHeirarchyChild(' + index + ',' + heirarchyArray[i].Id + ')"><a >' + heirarchyArray[i].HierarchyName + ' <i class="icon-angle-right v-folder"></i></a> </li>';
                    }
                    $(selectorid).empty();
                    $(selectorid).append(str);

                } 
            }
        }
        var method = 'GetHierarchies';
        var params = '{"token":"' + TOKEN() + '","hierarchy":' + JSON.stringify(hierarchy) + '}';
        ajaxJsonCall(method, params, responsefunction, true, 'POST', true)

    }

    function UpdateDeviceheirarchy(SelectedDeviceIds, HierarchyId, gId) {
        var updateDeviceReq = new Object();
        var Selector = new Object();
        var Device = new Object();

        Device.HierarchyId = HierarchyId;

        Selector.SelectedItemIds = SelectedDeviceIds;
        Selector.UnSelectedItemIds = null;

        updateDeviceReq.Device = Device;
        updateDeviceReq.DeviceSearch = null;
        updateDeviceReq.Selector = Selector;
        var callbackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'hierarchy_updated');
                    bindGrid(gId);
                } 
            }
        }
        var method = 'UpdateDevice';
        var params = '{"token":"' + TOKEN() + '","updateDeviceReq":' + JSON.stringify(updateDeviceReq) + '}';
        ajaxJsonCall(method, params, callbackfunction, true, 'POST', true)
        
    }

});