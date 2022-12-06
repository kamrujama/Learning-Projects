define(["knockout", "koUtil"], function (ko, koUtil) {

    function AdvanchSearchViewModal() {
        setbaselavel = '';
        isbaseLevel = '';
        isbaseHierarchyName = '';
        isbaseHierarchyId = '';
        var self = this;
        self.name = 'Advanced Search';
        self.HierarchyLevels = '';
        //self.HierarchyPathArr = new Array();
        self.HierarchyPathArr = ko.observableArray();
        self.HierarchyPathStorage = ko.observableArray();
        self.attributeDataArr = new Array();
        self.privateSearch = new Array();
        self.publicSearch = new Array();
        self.quickSearch = new Array();
        self.selectedGroupsForAdSearch == new Array();
        self.deviceSearchObj = new Object();
        self.gridIdForAdvanceSearch = '';
        self.hierarchyfor = '';
        self.attributeType = '';
        self.deviceAttributesData = new Array();
        self.deviceAttributesDataAdvSearch = new Array();
        self.testh = ko.observable();
        self.resetAddSerchFlag = '';
        self.newAddedDataFieldsArr = new Array();
        self.newAddedgridColumns = new Array();
        self.ExportDynamicColumns = new Array();
        self.SearchForChart = false;
        self.SearchForGrid = true;
        self.AdScreenName = '';
        self.criteriaGroups = ko.observableArray();
        self.ADAllSearches = ko.observableArray();
        self.flageForDeleteAndSave = ko.observable(false);
        self.initColumnsArr = new Array();
        self.localDynamicColumns = new Array();
        self.isAdvancedFilter = false;
        self.checkexistParent = new Array();

        self.isPopUpOpen = '';

        self.adEdit = ko.observable(false);
        self.adDelet = ko.observable(false);
        self.adCopy = ko.observable(false);

        self.selectedADData = ko.observable();
        self.selectedADIndex = ko.observable();

        self.backupAttrbuteCriteriaArr = new Array();
        self.backupAttrbuteCriteriaArrAdvSearch = new Array();

        self.selectedHierarchyIDs = new Array();
        self.userPreferenceColumns = ko.observableArray();

        ////for statemang
        self.AdvGridId = '';
        ////
       
        var hierarchyArr = new Array();

        ////new changes for save report
        self.SearchText = '';
        self.SearchCriteria = '';
        ////

        var kouserData = koUtil.UserData();
        var obj = new Object();
       
        if (kouserData != "") {
            obj.Description = kouserData.userHierarchies[0].Description;            
            obj.HierarchyFullPath = kouserData.userHierarchies[0].HierarchyName;
            obj.HierarchyIdFullPath = kouserData.userHierarchies[0].HierarchyIdFullPath;
            obj.HierarchyName = kouserData.userHierarchies[0].HierarchyName;
            obj.IPAddressRangeEnd = kouserData.userHierarchies[0].IPAddressRangeEnd;
            obj.IPAddressRangeStart = kouserData.userHierarchies[0].IPAddressRangeStart;
            obj.Id = kouserData.userHierarchies[0].Id;
            obj.IsChildExists = true;
            obj.Level = kouserData.userHierarchies[0].Level;
            obj.LocationId = kouserData.userHierarchies[0].LocationId;
            obj.ParentId = kouserData.userHierarchies[0].ParentId;
            obj.TimeZoneId = kouserData.userHierarchies[0].TimeZoneId;
            hierarchyArr.push(obj);

            setbaselavel = kouserData.userHierarchies[0].Level;
        }

        if (heirarchyData.length > 0) {
            for (var i = 0; i < heirarchyData.length; i++) {
                if (heirarchyData[i].Level == setbaselavel) {
                    heirarchyData[i].hierarchies = hierarchyArr;
                } else {
                    heirarchyData[i].hierarchies = [];
                }
            }
        }

        self.HierarchyLevels=heirarchyData;
        var arr = self.HierarchyLevels;
      

        self.getHierarchy = function (id, level, clback, IsChildExists) {
            
            function heirarchycallback(heirarchyData) {
                self.HierarchyLevels = heirarchyData;
                return clback(heirarchyData);
            }
            fetchHierarchies(id, level, heirarchycallback, IsChildExists);

            
            
            
            //return heirarchyData;

            
        }

        self.loadInitialUserData = function () {

            var kouserData = koUtil.UserData();
            var obj = new Object();
            var hierarchyArrInitial = new Array();

            if (kouserData != "") {
                obj.Description = kouserData.userHierarchies[0].Description;
                obj.HierarchyFullPath = kouserData.userHierarchies[0].HierarchyName;
                obj.HierarchyIdFullPath = kouserData.userHierarchies[0].HierarchyIdFullPath;
                obj.HierarchyName = kouserData.userHierarchies[0].HierarchyName;
                obj.IPAddressRangeEnd = kouserData.userHierarchies[0].IPAddressRangeEnd;
                obj.IPAddressRangeStart = kouserData.userHierarchies[0].IPAddressRangeStart;
                obj.Id = kouserData.userHierarchies[0].Id;
                obj.IsChildExists = true;
                obj.Level = kouserData.userHierarchies[0].Level;
                obj.LocationId = kouserData.userHierarchies[0].LocationId;
                obj.ParentId = kouserData.userHierarchies[0].ParentId;
                obj.TimeZoneId = kouserData.userHierarchies[0].TimeZoneId;
                hierarchyArrInitial.push(obj);

                if (heirarchyData && heirarchyData.length > 0)
                    heirarchyData[0].hierarchies = hierarchyArrInitial;
			}

            for (var i = 1; i < heirarchyData.length; i++) {
                heirarchyData[i].hierarchies = [];
            }
        }

        function fetchHierarchies(id, level, heirarchycallback, IsChildExists) {
            //level = level - 1;
            var hierarchy = new Object();
            
            hierarchy.Id = id;
            var hierarchyArr = new Array();
            if (heirarchyData[level] != undefined) {
                heirarchyData[level].hierarchies = [];
            }
            var responsefunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        
                        if (data.hierarchyList) {
                            data.hierarchyList = $.parseJSON(data.hierarchyList);
                            for (var h = 0; h < data.hierarchyList.length; h++) {

                                if (id != data.hierarchyList[h].Id) {
                                    var obj = new Object();
                                    obj.Description = data.hierarchyList[h].Description;
                                    obj.HierarchyFullPath = data.hierarchyList[h].HierarchyFullPath;
                                    obj.HierarchyIdFullPath = data.hierarchyList[h].HierarchyIdFullPath;
                                    obj.HierarchyName = data.hierarchyList[h].HierarchyName;
                                    obj.IPAddressRangeEnd = data.hierarchyList[h].IPAddressRangeEnd;
                                    obj.IPAddressRangeStart = data.hierarchyList[h].IPAddressRangeStart;
                                    obj.Id = data.hierarchyList[h].Id;
                                    obj.IsChildExists = data.hierarchyList[h].IsChildExists;
                                    obj.Level = data.hierarchyList[h].Level;
                                    obj.LocationId = data.hierarchyList[h].LocationId;
                                    obj.ParentId = data.hierarchyList[h].ParentId;
                                    obj.TimeZoneId = data.hierarchyList[h].TimeZoneId;
                                    obj.EntityUid = data.hierarchyList[h].EntityUid;
                                    obj.EntityType = data.hierarchyList[h].EntityType;
                                    hierarchyArr.push(obj);
                                    heirarchyData[(level - heirarchyData[0].Level) + 1].hierarchies = hierarchyArr;
                                } else {
                                    var obj = new Object();
                                    obj.Description = data.hierarchyList[h].Description;
                                    obj.HierarchyFullPath = data.hierarchyList[h].HierarchyFullPath;
                                    obj.HierarchyIdFullPath = data.hierarchyList[h].HierarchyIdFullPath;
                                    obj.HierarchyName = data.hierarchyList[h].HierarchyName;
                                    obj.IPAddressRangeEnd = data.hierarchyList[h].IPAddressRangeEnd;
                                    obj.IPAddressRangeStart = data.hierarchyList[h].IPAddressRangeStart;
                                    obj.Id = data.hierarchyList[h].Id;
                                    obj.IsChildExists = data.hierarchyList[h].IsChildExists;
                                    obj.Level = data.hierarchyList[h].Level;
                                    obj.LocationId = data.hierarchyList[h].LocationId;
                                    obj.ParentId = data.hierarchyList[h].ParentId;
                                    obj.TimeZoneId = data.hierarchyList[h].TimeZoneId;
                                    obj.EntityUid = data.hierarchyList[h].EntityUid;
                                    obj.EntityType = data.hierarchyList[h].EntityType;
                                    for (var i = 0; i < heirarchyData[level - heirarchyData[0].Level].hierarchies.length; i++) {
                                        if (heirarchyData[level - heirarchyData[0].Level].hierarchies[i].Id == obj.Id) {
                                            heirarchyData[level - heirarchyData[0].Level].hierarchies[i] = obj;
                                        }
                                    }
                                }
                            }
                        }
                        if (IsChildExists != undefined) {
                            if (!IsChildExists) {
                                if (heirarchyData[(level - heirarchyData[0].Level) + 1] == undefined) {
                                } else {
                                    heirarchyData[(level - heirarchyData[0].Level) + 1].hierarchies = [];
                                }
                            }
                        }

                        return heirarchycallback(heirarchyData);
                    } 
                }
                else if (error) {
                    $("#saveBtnsForEditHierarchy").hide();
                    $("#selectHierarchyBtns").hide();
                    $("#selectHierarchyForAddDevice").hide();
                    $("#selectHierarchyBtnsForDeviceProfile").hide();
                    $("#saveBtnsForEditHierarchy").hide();
                }
            }
            var params = '{"token":"' + TOKEN() + '","hierarchy":' + JSON.stringify(hierarchy) + '}';
            ajaxJsonCall('GetHierarchies', params, responsefunction, true, 'POST', true)

        }

        self.changeHierarchy = function (id, level, heirarchycallback, IsChildExists) {
            var hierarchy = new Object();
            hierarchy.Id = id;
            var hierarchyArr0 = new Array();
            var hierarchyArr = new Array();
            var rootHierarchyDataIndex = level - heirarchyData[0].Level;
            var responsefunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                        if (data.hierarchyList) {
                            data.hierarchyList = $.parseJSON(data.hierarchyList);
                            //setting the first hierarchy
                            var root = new Object();
                            root.Description = data.hierarchyList[0].Description;
                            root.HierarchyFullPath = data.hierarchyList[0].HierarchyFullPath;
                            root.HierarchyIdFullPath = data.hierarchyList[0].HierarchyIdFullPath;
                            root.HierarchyName = data.hierarchyList[0].HierarchyName;
                            root.IPAddressRangeEnd = data.hierarchyList[0].IPAddressRangeEnd;
                            root.IPAddressRangeStart = data.hierarchyList[0].IPAddressRangeStart;
                            root.Id = data.hierarchyList[0].Id;
                            root.IsChildExists = data.hierarchyList[0].IsChildExists;
                            root.Level = data.hierarchyList[0].Level;
                            root.LocationId = data.hierarchyList[0].LocationId;
                            root.ParentId = data.hierarchyList[0].ParentId;
                            root.TimeZoneId = data.hierarchyList[0].TimeZoneId;
                            root.EntityUid = data.hierarchyList[0].EntityUid;
                            root.EntityType = data.hierarchyList[0].EntityType;
                            hierarchyArr0.push(root);
                            heirarchyData[rootHierarchyDataIndex].hierarchies = hierarchyArr0;
                            self.selectedHierarchyIDs = jQuery.grep(self.selectedHierarchyIDs, function (value) {
                                return (value != data.hierarchyList[0].Id && value != null);
                            });

                            for (var h = 1; h < data.hierarchyList.length; h++) {
                                if (heirarchyData[0].Level != data.hierarchyList[h].Level) {
                                    var obj = new Object();
                                    obj.Description = data.hierarchyList[h].Description;
                                    obj.HierarchyFullPath = data.hierarchyList[h].HierarchyFullPath;
                                    obj.HierarchyIdFullPath = data.hierarchyList[h].HierarchyIdFullPath;
                                    obj.HierarchyName = data.hierarchyList[h].HierarchyName;
                                    obj.IPAddressRangeEnd = data.hierarchyList[h].IPAddressRangeEnd;
                                    obj.IPAddressRangeStart = data.hierarchyList[h].IPAddressRangeStart;
                                    obj.Id = data.hierarchyList[h].Id;
                                    obj.IsChildExists = data.hierarchyList[h].IsChildExists;
                                    obj.Level = data.hierarchyList[h].Level;
                                    obj.LocationId = data.hierarchyList[h].LocationId;
                                    obj.ParentId = data.hierarchyList[h].ParentId;
                                    obj.TimeZoneId = data.hierarchyList[h].TimeZoneId;
                                    obj.EntityUid = data.hierarchyList[h].EntityUid;
                                    obj.EntityType = data.hierarchyList[h].EntityType;
                                    hierarchyArr.push(obj);
                                    heirarchyData[(obj.Level - heirarchyData[0].Level)].hierarchies = hierarchyArr;

                                    self.selectedHierarchyIDs = jQuery.grep(self.selectedHierarchyIDs, function (value) {
                                        return (value != data.hierarchyList[h].Id && value != null);
                                    });
                                }
                            }
                        }
                        if (!IsChildExists) {
                            if (heirarchyData[(obj.Level - heirarchyData[0].Level) + 1] == undefined) {
                            } else {
                                heirarchyData[(obj.Level - heirarchyData[0].Level) + 1].hierarchies = [];
                            }
        }

                        return heirarchycallback(heirarchyData);
                    } 
                }
            }
            var params = '{"token":"' + TOKEN() + '","hierarchy":' + JSON.stringify(hierarchy) + '}';
            ajaxJsonCall('GetHierarchies', params, responsefunction, true, 'POST', true);
        }
        //self.HierarchyLevels

        ///for dynamic Grid Column generation
        self.generateDynamicColumnAndFields = function (DynamicColumns, DataFieldsArr, gridColumns, buildFilterPanel, buildFilterPanelDate, buildFilterPanelMultiChoice) {
            
            for (var i = 0; i < DynamicColumns.length; i++) {
                var FieldSource = _.where(DataFieldsArr, { name: DynamicColumns[i].AttributeName });
                
                if (FieldSource = '') {
                    var dynamicObj = new Object();
                    dynamicObj.name = DynamicColumns[i].AttributeName;
                    dynamicObj.map = 'DeviceDetail>' + DynamicColumns[i].AttributeName;
                    DataFieldsArr.push(dynamicObj);
                }
                var ColumnSource = _.where(gridColumns, { datafield: DynamicColumns[i].AttributeName });
                if (ColumnSource == '') {
                    gridColumns.push({
                        text: i18n.t(DynamicColumns[i].DisplayName, { lng: lang }), datafield: DynamicColumns[i].AttributeName, editable: false, minwidth: 100, width: 'auto',
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    });
                }
            }
            var returnObj = new Object();
            returnObj.DataFieldsArr = DataFieldsArr;
            returnObj.gridColumns = gridColumns;
            return returnObj;
        };
        ///

        
    }

    return new AdvanchSearchViewModal();
});