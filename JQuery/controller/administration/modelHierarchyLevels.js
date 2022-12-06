define(["knockout", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, autho) {
    var lang = getSysLang();
    fileData = new Array();
    isSetLevel = false;
    isDeleteLevel = false;
    isAddLevel = false;

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function AddpackageViewModel() {

       
        // allow only 255 charcters in hierarchyLevel.
        $("#levelNameText").on("keypress keyup paste", function (e) {
            var textMax = 255;
            var textLength = $('#levelNameText').val().length;
            var textRemaining = textMax - textLength;
        });


        var self = this;
       

        $('#cancelHierarchyLevels').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#cancelHierarchyLevels').click();
            }
        });

        $('#saveHierarchyLevels').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#saveHierarchyLevels').click();
            }
        });
        //-----------------------------------------------------FOCUS OF BUTTON ON POP UP---------------------------------
        $('#downloadModel').on('shown.bs.modal', function (e) {
            $('#hierarchyDeleteModel_Btn_No').focus();

        });

        $('#downloadModel').keydown(function (e) {
            if ($('#hierarchyDeleteModel_Btn_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#hierarchyDeleteModel_Btn_Yes').focus();
            }
        });
        //-----------------------------------------------------------------------------------------------------------
        $('#mdlHierarchyLevelHeader').mouseup(function () {
            $("#mdlHierarchyLevel").draggable({ disabled: true });
        });

        $('#mdlHierarchyLevelHeader').mousedown(function () {
            $("#mdlHierarchyLevel").draggable({ disabled: false });
        });



        //Check Rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        self.hierarchyLevel = ko.observableArray();
        var deleteName = ''
        var deleteLevel = '';

        for (i = 0; i < heirarchyData.length; i++) {
            var obj = new Object();
            obj.Level = heirarchyData[i].Level;
            obj.Name = heirarchyData[i].Name;
            self.hierarchyLevel.push(obj);
        }

        self.addLevel = function (data) {
            var addIndex = data.Level - heirarchyData[0].Level;
            if (addIndex < self.hierarchyLevel().length - 1) {
                levelIndex = addIndex + 1;
                $('#levelNameText' + levelIndex).focus();
            } else {
                if (self.hierarchyLevel().length < 15) {
                    var obj = new Object();
                    obj.Level = data.Level + 1;
                    obj.Name = '';
                    self.hierarchyLevel.push(obj);
                }
            }
        }

        self.deleteLevel = function (data) {
            var arr = self.hierarchyLevel();
            var deleteIndex = data.Level - heirarchyData[0].Level;
            var arrayLegth = arr.length;
            self.hierarchyLevel.splice(deleteIndex, arrayLegth - deleteIndex + 1);
            deleteName = data.Name.trim();
            deleteLevel = data.Level;

        }


        self.levelNameLbl = ko.observable();
        self.levelNameText = ko.observable();

        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');

        //Load template
        function loadelement(elementname, controllerId) {

            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        //Generate template
        function generateTemplate(tempname, controllerId) {
            //new template code
            var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
            var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';


            ko.components.register(tempname, {
                viewModel: { require: ViewName },
                template: { require: 'plugin/text!' + htmlName }
            });
            //  end new template code
        }

        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
        }

        //Cancel button click
        self.cancelReset = function () {
            $('#hierarchyDeleteModel').modal('hide');
            $('#downloadModel').modal('hide');
            self.observableModelPopup('unloadTemplate');


        }

        //Save button click
        self.saveHierarchy = function (observableModelPopup, refreshData) {
            var arr = self.hierarchyLevel();
            for (var j = 0; j < arr.length; j++) {
                var nm = arr[j].Name;
                nm = nm.trim();
                if (nm == '' || nm == null) {
                    openAlertpopup(2, 'one_more_hierarchy_levels_was_blank');
                    return;
                }
            }
            var CheckChages = '';
            if (heirarchyData.length < self.hierarchyLevel().length) {
                var arr = self.hierarchyLevel();
                var newHierarchyData = new Array();

                for (i = heirarchyData.length; i < arr.length; i++) {
                    var obj = new Object();
                    obj.Level = arr[i].Level;
                    obj.Name = arr[i].Name.trim();
                    newHierarchyData.push(obj);
                }

                if (CheckChages == 1) {
                    openAlertpopup(2, 'one_more_hierarchy_levels_was_blank');
                } else {
                    self.processAddedLevels(newHierarchyData, observableModelPopup, refreshData);
                }
            } else if (heirarchyData.length > self.hierarchyLevel().length) {
                $('#hierarchyDeleteModel').modal('show');
                $("#deleteHierarchy").text(i18n.t('sure_del_hierarchy_level', { lng: lang }));
            } else if (heirarchyData.length == self.hierarchyLevel().length) {
                isSetLevel = true;
                var arr = self.hierarchyLevel();
                for (var j = 0; j < arr.length; j++) {
                    if (arr[j].Name == '' || arr[j].Name == null) {
                        CheckChages = 1;
                    }
                }
                if (CheckChages == 1) {
                    openAlertpopup(2, 'one_more_hierarchy_levels_was_blank');
                } else {
                    self.setHierarchyLevels(observableModelPopup, 3, refreshData);
                }
            }
        }

        //Delete button click
        self.hierarchyDelete = function (observableModelPopup, refreshData) {
            var arr = self.hierarchyLevel();
            for (i = 0; i < heirarchyData.length; i++) {
                var deletHierarchyObj = new Object();
                deletHierarchyObj.Level = heirarchyData[i].Level;
                deletHierarchyObj.Name = heirarchyData[i].Name.trim();
            }

            if (deleteName == '' || deleteLevel == '') {

            } else {

                deletHierarchyObj.Level = deleteLevel;
                deletHierarchyObj.Name = deleteName;
                self.deleteHierarchyLevels(deletHierarchyObj, observableModelPopup, refreshData);
            }
        }

        //Edit Hierarchy Levels
        self.setHierarchyLevels = function (observableModelPopup, levelId, refreshData) {
            $("#loadingDiv").show();
            if (isDeleteLevel == true || isAddLevel == true)
                isSetLevel = false;

            var arr = self.hierarchyLevel();
            var newHierarchyData = new Array();
            for (i = 0; i < arr.length; i++) {
                var objNew = new Object();
                objNew.Level = arr[i].Level;
                objNew.Name = arr[i].Name.trim();
                newHierarchyData.push(objNew);
            }

            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        getHierarchyLevels(levelId, refreshData);
                        $('#downloadModel').modal('hide');
                        observableModelPopup('unloadTemplate');
                        if (isSetLevel == true)
                            openAlertpopup(0, 'hierarcy_level_success');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('HIERARCHY_LEVEL_UNIQUE_KEY')) {
                        $("#loadingDiv").hide();
                        openAlertpopup(2, 'hierarchy_name_unique');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('HIERARCHY_LIMIT_EXCEDDED')) {
                        $("#loadingDiv").hide();
                        openAlertpopup(2, 'hierarchy_full_path_excedded');
                    }else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
                        $("#loadingDiv").hide();
                        Token_Expired();
                    } else if (data.responseStatus.StatusCode == AppConstants.get('UNAUTHORIZED_ACCESS')) {
                        $("#loadingDiv").hide();
                    }
                } else if (error) {
                    $("#loadingDiv").hide();
                }
            }

            var method = 'SetHierarchyLevels';
            var params = '{"token":"' + TOKEN() + '","hierarchyLevels":' + JSON.stringify(newHierarchyData) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
        }

        //Delete Hierarchy Levels
        self.deleteHierarchyLevels = function (deletHierarchyObj, observableModelPopup, refreshData) {
            $("#loadingDiv").show();
            isDeleteLevel = true;
            $('#hierarchyDeleteModel').modal('hide');
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        $('#downloadModel').modal('hide');
                        observableModelPopup('unloadTemplate');
                        openAlertpopup(0, 'Level_deleted_successfully');
                        self.setHierarchyLevels(observableModelPopup, 0, refreshData);
                    } else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
                        $("#loadingDiv").hide();
                        Token_Expired();
                    } else if (data.responseStatus.StatusCode == AppConstants.get('HIERARCHY_LIMIT_EXCEDDED')) {
                        $("#loadingDiv").hide();
                        openAlertpopup(2, 'hierarchy_full_path_excedded');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('UNAUTHORIZED_ACCESS')) {
                        $("#loadingDiv").hide();
                    } else if (data.responseStatus.StatusCode != AppConstants.get('SUCCESS')) {
                        $("#loadingDiv").hide();
                        openAlertpopup(2, 'changes_not_completed_to_level');
                    }
                } else if (error) {
                    $("#loadingDiv").hide();
                }
            }

            var method = 'DeleteHierarchyLevel';
            var params = '{"token":"' + TOKEN() + '","hierarchyLevel":' + JSON.stringify(deletHierarchyObj) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);

        }

        //Added new Hierarchy Levels
        self.processAddedLevels = function (newHierarchyData, observableModelPopup, refreshData) {
            $("#loadingDiv").show();
            isAddLevel = true;
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        $('#downloadModel').modal('hide');
                        observableModelPopup('unloadTemplate');
                        openAlertpopup(0, 'level_success');
                        self.setHierarchyLevels(observableModelPopup, 1, refreshData);
                    } else if (data.responseStatus.StatusCode == AppConstants.get('HIERARCHY_LEVEL_UNIQUE_KEY')) {
                        $("#loadingDiv").hide();
                        openAlertpopup(2, 'duplicate_hierarchy_level_found');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('HIERARCHY_LIMIT_EXCEDDED')) {
                        $("#loadingDiv").hide();
                        openAlertpopup(2, 'hierarchy_full_path_excedded');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
                        $("#loadingDiv").hide();
                        Token_Expired();
                    } else if (data.responseStatus.StatusCode == AppConstants.get('UNAUTHORIZED_ACCESS')) {
                        $("#loadingDiv").hide();
                    } else if (data.responseStatus.StatusCode == AppConstants.get('E_INVALID_INPUT_FORMAT')) {
                        $("#loadingDiv").hide();
                    }
                } else if (error) {
                    $("#loadingDiv").hide();
                }
            }

            var method = 'AddHierarchyLevels';
            var params = '{"token":"' + TOKEN() + '","hierarchyLevels":' + JSON.stringify(newHierarchyData) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
        }
        function getHierarchyLevels(levelIdFlag, refreshData) {
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.hierarchyLevels)
                            data.hierarchyLevels = $.parseJSON(data.hierarchyLevels);
                        refreshData();
                        if (levelIdFlag == 1) {
                            for (var i = 0; i < data.hierarchyLevels.length; i++) {
                                var source = _.where(heirarchyData, { Name: data.hierarchyLevels[i].Name });
                                
                                data.hierarchyLevels[i].hierarchies = [];
                                if (source == '') {
                                    heirarchyData.push(data.hierarchyLevels[i]);
                                }
                            }
                            
                        }
                        if (levelIdFlag == 0) {
                            var arr = heirarchyData;
                            for (var j = 0; j < arr.length; j++) {
                                
                                var source = _.where(data.hierarchyLevels, { Name: arr[j].Name });
                                    
                                    if (source == '') {
                                        
                                        heirarchyData = jQuery.grep(heirarchyData, function (value) {
                                            var l = heirarchyData.indexOf(arr[j]);
                                            return (value != heirarchyData[l] && value != null);
                                            
                                        });
                                    }

                            }
                            //heirarchyData = arr;
                        }
                        if (levelIdFlag == 3) {

                            for (var i = 0; i < data.hierarchyLevels.length; i++) {
                                var source = _.where(heirarchyData, { Level: data.hierarchyLevels[i].Level });
                                if (source != '') {
                                    heirarchyData[i].Name = data.hierarchyLevels[i].Name;
                                }
                            }

                        }
                   
                        // heirarchyData = data.hierarchyLevels;
                        
                    } else if (data.responseStatus.StatusCode == AppConstants.get('UNAUTHORIZED_ACCESS')) {
                        $("#loadingDiv").hide();
                    }
                }
                if (error) {
                    $("#loadingDiv").hide();
                }
                
            }

            var method = 'GetHierarchyLevels';
            var params = '{"token":"' + TOKEN() + '"}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);

        }

        seti18nResourceData(document, resourceStorage);
    };
});
