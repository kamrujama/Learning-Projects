function buildMultiInstanceTree(parameterFormFiles, level, parentLevelName, formFileXML) {
	var formFileJson = $.xml2json(formFileXML);
	var showLevel = false;
	var treeNode = new Object();

	if (formFileJson.ParameterFile && formFileJson.ParameterFile.Container && formFileJson.ParameterFile.Container.length > 0) {
		for (var i = 0; i < formFileJson.ParameterFile.Container.length; i++) {
			if (formFileJson.ParameterFile.Container[i].Type == AppConstants.get('GRID')) {				//List view
				continue;
			} else if (formFileJson.ParameterFile.Container[i].Type == AppConstants.get('NORMAL')) {	//Details view
				if (formFileJson.ParameterFile.Container[i].Container && formFileJson.ParameterFile.Container[i].Container.length > 0) {
					for (var j = 0; j < formFileJson.ParameterFile.Container[i].Container.length; j++) {
						if (formFileJson.ParameterFile.Container[i].Container[j].DeviceOperation) {
							if (formFileJson.ParameterFile.Container[i].Container[j].DeviceOperation != AppConstants.get('NONE_OPERATION')) {
								showLevel = true;
								break;
							}
						} else {
							showLevel = true;
							break;
						}
					}
				} else {
					if (formFileJson.ParameterFile.Container[i].Container.DeviceOperation) {
						if (formFileJson.ParameterFile.Container[i].Container.DeviceOperation != AppConstants.get('NONE_OPERATION')) {
							showLevel = true;
							break;
						}
					} else {
						showLevel = true;
						break;
					}
				}
			} else {	//For Non-MultiInstance containers
				if (formFileJson.ParameterFile.Container[i].DeviceOperation) {
					if (formFileJson.ParameterFile.Container[i].DeviceOperation != AppConstants.get('NONE_OPERATION')) {
						showLevel = true;
						break;
					}
				} else {
					showLevel = true;
					break;
				}
			}
		}
	} else if (formFileJson.ParameterFile && formFileJson.ParameterFile.Container) {	//For Non-MultiInstance container
		if (formFileJson.ParameterFile.Container.DeviceOperation) {
			if (formFileJson.ParameterFile.Container.DeviceOperation != AppConstants.get('NONE_OPERATION')) {
				showLevel = true;
			}
		} else {
			showLevel = true;
		}
	}

	treeNode.isLevelAccess = showLevel;

	if (level == 0) {
		if (showLevel) {
			treeNode.isParentLevelAccess = true;
		} else {
			treeNode.isParentLevelAccess = false;
		}
	} else if (level >= 1) {
		var parentNode = _.where(parameterFormFiles, { LevelName: parentLevelName });
		if (parentNode && parentNode.length > 0) {
			treeNode.isParentLevelAccess = parentNode[0].isLevelAccess;
		}
	}

	return treeNode;
}

function buildMultiInstanceTreeForTemplate(parameterFormFiles, level, parentLevelName, formFileXML, relation, isLookupTemplate) {
	var formFileJson = $.xml2json(formFileXML);
	var showLevel = false;
	var treeNode = new Object();

	if (level > 0 && ((isLookupTemplate && !relation) || ((!isLookupTemplate && relation))) ) {
		treeNode.isLevelAccess = showLevel;

		var parentNode = _.where(parameterFormFiles, { LevelName: parentLevelName });
		if (parentNode && parentNode.length > 0) {
			treeNode.isParentLevelAccess = parentNode[0].isLevelAccess;
		}
		return treeNode;
	}

	if (formFileJson.ParameterFile && formFileJson.ParameterFile.Container && formFileJson.ParameterFile.Container.length > 0) {
		for (var i = 0; i < formFileJson.ParameterFile.Container.length; i++) {
			if (formFileJson.ParameterFile.Container[i].Type == AppConstants.get('GRID')) {				//List view
				continue;
			} else if (formFileJson.ParameterFile.Container[i].Type == AppConstants.get('NORMAL')) {	//Details view
				if (formFileJson.ParameterFile.Container[i].Container && formFileJson.ParameterFile.Container[i].Container.length > 0) {
					for (var j = 0; j < formFileJson.ParameterFile.Container[i].Container.length; j++) {
						if (formFileJson.ParameterFile.Container[i].Container[j].TemplateOperation) {
							if (formFileJson.ParameterFile.Container[i].Container[j].TemplateOperation != AppConstants.get('NONE_OPERATION')) {
								showLevel = true;
								break;
							}
						} else {
							showLevel = true;
							break;
						}
					}
				} else {
					if (formFileJson.ParameterFile.Container[i].Container.TemplateOperation) {
						if (formFileJson.ParameterFile.Container[i].Container.TemplateOperation != AppConstants.get('NONE_OPERATION')) {
							showLevel = true;
							break;
						}
					} else {
						showLevel = true;
						break;
					}
				}
			} else {	//For Non-MultiInstance containers
				if (formFileJson.ParameterFile.Container[i].TemplateOperation) {
					if (formFileJson.ParameterFile.Container[i].TemplateOperation != AppConstants.get('NONE_OPERATION')) {
						showLevel = true;
						break;
					}
				} else {
					showLevel = true;
					break;
				}
			}
		}
	} else if (formFileJson.ParameterFile && formFileJson.ParameterFile.Container) {	//For Non-MultiInstance container
		if (formFileJson.ParameterFile.Container.TemplateOperation) {
			if (formFileJson.ParameterFile.Container.TemplateOperation != AppConstants.get('NONE_OPERATION')) {
				showLevel = true;
			}
		} else {
			showLevel = true;
		}
	}

	treeNode.isLevelAccess = showLevel;

	if (level == 0) {
		if (showLevel) {
			treeNode.isParentLevelAccess = true;
		} else {
			treeNode.isParentLevelAccess = false;
		}
	} else if (level >= 1) {
		var parentNode = _.where(parameterFormFiles, { LevelName: parentLevelName });
		if (parentNode && parentNode.length > 0) {
			treeNode.isParentLevelAccess = parentNode[0].isLevelAccess;
		}
	}

	return treeNode;
}

function GenerateContainerData(data, tabContainer, paramLevel, DeviceParamAppGID, rootXml, clickLevel, isUpdate, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, isDeviceSearch, koUtil, isDevice) {
	var obj = new Object();
	obj.Name = data.Name;
	paramLevel = 0;
	obj.LevelClicked = (rootXml != undefined) ? rootXml.Parent : undefined;
	obj.paramLevel = paramLevel;
	if (data.DisplayName != undefined) {
		if (data.DisplayName.indexOf('$APPGID$') !== -1) {
			if (DeviceParamAppGID != '') {
				obj.DisplayName = data.DisplayName.replace("$APPGID$", DeviceParamAppGID);
			} else {
				obj.DisplayName = data.DisplayName;
			}
		} else {
			obj.DisplayName = data.DisplayName;
		}
	} else {
		if (data.Name.indexOf('$APPGID$') !== -1) {
			if (DeviceParamAppGID != '') {
				obj.DisplayName = data.Name.replace("$APPGID$", DeviceParamAppGID);
			} else {
				obj.DisplayName = data.Name;
			}
		} else {
			obj.DisplayName = data.Name;
		}
	}

	obj.Type = data.Type != undefined ? data.Type : AppConstants.get('GENERAL');
	if (data.Type == AppConstants.get('NORMAL')) {
		obj.Access = data.Container ? (data.Container.Access ? data.Container.Access : AppConstants.get('BASIC_ACCESS')) : AppConstants.get('BASIC_ACCESS');
	} else if (data.Type == AppConstants.get('GRID')) {
		obj.Access = AppConstants.get('VIEW_ACCESS');
	} else {
		obj.Access = data.Access != undefined ? data.Access : AppConstants.get('BASIC_ACCESS');
	}

	var isContainerViewAllowed = false;
	var isContainerEditAllowed = false;
	if (obj.Access == AppConstants.get('BASIC_ACCESS')) {
		isContainerViewAllowed = retvalForBasicParamView;
		isContainerEditAllowed = retvalForBasicParamEdit;
	} else if (obj.Access == AppConstants.get('ADVANCED_ACCESS')) {
		isContainerViewAllowed = retvalForAdvParamView;
		isContainerEditAllowed = retvalForAdvParamEdit;
	} else if (obj.Access == AppConstants.get('VIEW_ACCESS')) {
		isContainerViewAllowed = true;
		isContainerEditAllowed = false;
	}

	if (obj.DisplayName == AppConstants.get('DETAILS')) {
		isContainerViewAllowed = true;
	}

	if (isDevice) {
		isContainerViewAllowed = data.DeviceOperation ? (data.DeviceOperation != AppConstants.get('NONE_OPERATION') ? isContainerViewAllowed : false) : isContainerViewAllowed;
		isContainerEditAllowed = data.DeviceOperation ? (data.DeviceOperation == AppConstants.get('READWRITE_OPERATION') ? isContainerEditAllowed : false) : isContainerEditAllowed;
	}

	obj.AllowView = isContainerViewAllowed;
	obj.AllowModify = isContainerEditAllowed;
	obj.AllowAdd = ((rootXml != undefined && rootXml.AllowAdd != undefined && (rootXml.AllowAdd).toUpperCase() == "TRUE") ? true : false);
	obj.AllowDelete = ((rootXml != undefined && rootXml.AllowDelete != undefined && (rootXml.AllowDelete).toUpperCase() == "TRUE") ? true : false);
	if (isUpdate == true || isUpdate == undefined) {
		obj.AllowEdit = ((rootXml != undefined && rootXml.AllowEdit != undefined && (rootXml.AllowEdit).toUpperCase() == "TRUE") ? true : false);
	} else {
		obj.AllowEdit = false;
	}
	obj.AllowSequence = ((rootXml != undefined && rootXml.AllowSequence != undefined && (rootXml.AllowSequence).toUpperCase() == "TRUE") ? true : false);

	if (obj.Access != AppConstants.get('NONE_ACCESS') && isContainerViewAllowed) {
		obj.Container = generatePanelData(data, paramLevel, DeviceParamAppGID, rootXml, clickLevel, isUpdate, isContainerViewAllowed, isContainerEditAllowed, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, isDeviceSearch, koUtil, isDevice);
		tabContainer.push(obj);
	}
}

function generatePanelData(data, paramLevel, DeviceParamAppGID, rootXml, clickLevel, isUpdate, isContainerViewAllowed, isContainerEditAllowed, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, isDeviceSearch, koUtil, isDevice) {
	var arr = new Array();
	var obj = new Object();
	obj.Name = data.Name;

	if (data.DisplayName != undefined) {
		if (data.DisplayName.indexOf('$APPGID$') !== -1) {
			if (DeviceParamAppGID != undefined && DeviceParamAppGID != '') {
				obj.DisplayName = data.DisplayName.replace("$APPGID$", DeviceParamAppGID);
			} else {
				obj.DisplayName = data.DisplayName;
			}
		} else {
			obj.DisplayName = data.DisplayName;
		}
	} else {
		if (data.Name.indexOf('$APPGID$') !== -1) {
			if (DeviceParamAppGID != undefined && DeviceParamAppGID != '') {
				obj.DisplayName = data.Name.replace("$APPGID$", DeviceParamAppGID);
			} else {
				obj.DisplayName = data.Name;
			}
		} else {
			obj.DisplayName = data.Name;
		}
	}

	obj.Access = data.Access != undefined ? data.Access : AppConstants.get('BASIC_ACCESS');
	obj.Type = data.Type != undefined ? data.Type : AppConstants.get('GENERAL');
	if (obj.DisplayName == AppConstants.get('DETAILS'))
		obj.Type = AppConstants.get('DETAILS');

	obj.AllowView = isContainerViewAllowed;
	obj.AllowModify = isContainerEditAllowed;
	obj.AllowAdd = ((rootXml != undefined && rootXml.AllowAdd != undefined && (rootXml.AllowAdd).toUpperCase() == "TRUE") ? true : false);
	obj.AllowDelete = ((rootXml != undefined && rootXml.AllowDelete != undefined && (rootXml.AllowDelete).toUpperCase() == "TRUE") ? true : false);
	if (isUpdate == true || isUpdate == undefined) {
		obj.AllowEdit = ((rootXml != undefined && rootXml.AllowEdit != undefined && (rootXml.AllowEdit).toUpperCase() == "TRUE") ? true : false);
	} else {
		obj.AllowEdit = false;
	}
	obj.AllowSequence = (rootXml != undefined && rootXml.AllowSequence != undefined && (rootXml.AllowSequence).toUpperCase() == "TRUE") ? true : false;

	paramLevel = paramLevel + 1;
	var cal = 0;
	cal = paramLevel;
	cal = cal * 2;
	obj.paramLevel = cal;
	if (data.Param != undefined) {
		if (data.Param.length == undefined)
			data.Param = $.makeArray(data.Param);

		for (var p = 0; p < data.Param.length; p++) {

			var isParamViewAllowed = false;
			var isParamEditAllowed = false;
			if (isContainerViewAllowed && isContainerEditAllowed) {
				if (data.Param[p].Access == AppConstants.get('BASIC_ACCESS')) {
					isParamViewAllowed = retvalForBasicParamView;
					isParamEditAllowed = retvalForBasicParamEdit;
				} else if (data.Param[p].Access == AppConstants.get('ADVANCED_ACCESS')) {
					isParamViewAllowed = retvalForAdvParamView;
					isParamEditAllowed = retvalForAdvParamEdit;
				} else if (data.Param[p].Access == AppConstants.get('VIEW_ACCESS')) {
					isParamViewAllowed = true;
					isParamEditAllowed = false;
				}
			} else if (isContainerViewAllowed && !isContainerEditAllowed) {
				if (data.Param[p].Access == AppConstants.get('BASIC_ACCESS')) {
					isParamViewAllowed = retvalForBasicParamView;
				} else if (data.Param[p].Access == AppConstants.get('ADVANCED_ACCESS')) {
					isParamViewAllowed = retvalForAdvParamView;
				} else if (data.Param[p].Access == AppConstants.get('VIEW_ACCESS')) {
					isParamViewAllowed = true;
				}
				isParamEditAllowed = false;
			}
			if (data.Param[p].ValueType && data.Param[p].ValueType.Type == "File") {
				isParamEditAllowed = false;
			}

			if (data.Param[p].ParamId != undefined) {

			} else {
				data.Param[p]["ParamId"] = 0;
			}
			if (data.Param[p].DisplayName != undefined) {

			} else {
				data.Param[p]["DisplayName"] = data.Param[p].Name;
			}
			if (data.Param[p].Description != undefined) {
				
			} else {
				data.Param[p]["Description"] = 'N/A';
			}
			if (data.Param[p].ParamValue == undefined) {
				//if (clickLevel != 0) {
					data.Param[p]["ParamValue"] = '';
				//}
			}

			data.Param[p].Access = data.Param[p].Access != undefined ? data.Param[p].Access : AppConstants.get('BASIC_ACCESS');
			data.Param[p].AllowView = data.Param[p].Access != AppConstants.get('NONE_ACCESS') ? isParamViewAllowed : false;
			data.Param[p].AllowModify = data.Param[p].Access != AppConstants.get('NONE_ACCESS') ? isParamEditAllowed : false;
		}
		if (isUpdate == false) {
			obj.Param = _.where(data.Param, { SourceType: 'User' });
		} else if (koUtil.displayPrimaryIdentifiers == false) {
			for (var k = 0; k < data.Param.length; k++) {
				if (data.Param[k].PrimaryIdentifier == undefined || data.Param[k].PrimaryIdentifier == null) {
					data.Param[k].PrimaryIdentifier = 'False';
				}
			}
			obj.Param = _.where(data.Param, { PrimaryIdentifier: 'False' });
		} else {
			obj.Param = data.Param;
		}

	} else {
		obj.Param = [];
	}
	if (data.Container != undefined) {
		if (data.Container.length == undefined)
			data.Container = $.makeArray(data.Container);

		var newarr = new Array();
		var cal = 0;
		for (var c = 0; c < data.Container.length; c++) {
			cal = 1;
			paramLevel = cal;

            data.Type = data.Type != undefined ? data.Type : AppConstants.get('NORMAL');
            if (data.Type == AppConstants.get('NORMAL')) {
				data.Container[c].Access = data.Container ? (data.Container[c].Access ? data.Container[c].Access : AppConstants.get('BASIC_ACCESS')) : AppConstants.get('BASIC_ACCESS');
			}

			isContainerViewAllowed = false;
			isContainerEditAllowed = false;
			if (data.Container[c].Access == AppConstants.get('BASIC_ACCESS')) {
				isContainerViewAllowed = retvalForBasicParamView;
				isContainerEditAllowed = retvalForBasicParamEdit;
			} else if (data.Container[c].Access == AppConstants.get('ADVANCED_ACCESS')) {
				isContainerViewAllowed = retvalForAdvParamView;
				isContainerEditAllowed = retvalForAdvParamEdit;
			} else if (data.Container[c].Access == AppConstants.get('VIEW_ACCESS')) {
				isContainerViewAllowed = true;
				isContainerEditAllowed = false;
			}

			if (isDevice) {
				isContainerViewAllowed = data.Container[c].DeviceOperation ? (data.Container[c].DeviceOperation != AppConstants.get('NONE_OPERATION') ? isContainerViewAllowed : false) : isContainerViewAllowed;
				isContainerEditAllowed = data.Container[c].DeviceOperation ? (data.Container[c].DeviceOperation == AppConstants.get('READWRITE_OPERATION') ? isContainerEditAllowed : false) : isContainerEditAllowed;
			}

			if (data.Container[c].Access != AppConstants.get('NONE_ACCESS') && isContainerViewAllowed) {
				newarr.push(generatePanelData(data.Container[c], paramLevel, DeviceParamAppGID, rootXml, clickLevel, true, isContainerViewAllowed, isContainerEditAllowed, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, isDeviceSearch, koUtil, isDevice));
			}

		}
		obj.Container = newarr;
		arr.push(obj);
		return arr;

	} else {
		obj.Container = [];
	}

	arr.push(obj);
	return arr;
}

function GenerateContainerDataAddInstance(data, tabContainer, paramLevel, DeviceParamAppGID, rootXml, clickLevel, isUpdate, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, isDeviceSearch, koUtil, isDevice) {
	var obj = new Object();
	obj.Name = data.Name;
	paramLevel = 0;
	obj.LevelClicked = (rootXml != undefined) ? rootXml.Parent : undefined;
	obj.paramLevel = paramLevel;
	if (data.DisplayName != undefined) {
		if (data.DisplayName.indexOf('$APPGID$') !== -1) {
			if (DeviceParamAppGID != '') {
				obj.DisplayName = data.DisplayName.replace("$APPGID$", DeviceParamAppGID);
			} else {
				obj.DisplayName = data.DisplayName;
			}
		} else {
			obj.DisplayName = data.DisplayName;
		}
	} else {
		if (data.Name.indexOf('$APPGID$') !== -1) {
			if (DeviceParamAppGID != '') {
				obj.DisplayName = data.Name.replace("$APPGID$", DeviceParamAppGID);
			} else {
				obj.DisplayName = data.Name;
			}
		} else {
			obj.DisplayName = data.Name;
		}
	}

	obj.Type = data.Type != undefined ? data.Type : AppConstants.get('GENERAL');
	if (data.Type == AppConstants.get('NORMAL')) {
		obj.Access = data.Container ? (data.Container.Access ? data.Container.Access : AppConstants.get('BASIC_ACCESS')) : AppConstants.get('BASIC_ACCESS');
	} else if (data.Type == AppConstants.get('GRID')) {
		obj.Access = AppConstants.get('VIEW_ACCESS');
	} else {
		obj.Access = data.Access != undefined ? data.Access : AppConstants.get('BASIC_ACCESS');
	}

	var isContainerViewAllowed = false;
	var isContainerEditAllowed = false;
	if (obj.Access == AppConstants.get('BASIC_ACCESS')) {
		isContainerViewAllowed = retvalForBasicParamView;
		isContainerEditAllowed = retvalForBasicParamEdit;
	} else if (obj.Access == AppConstants.get('ADVANCED_ACCESS')) {
		isContainerViewAllowed = retvalForAdvParamView;
		isContainerEditAllowed = retvalForAdvParamEdit;
	} else if (obj.Access == AppConstants.get('VIEW_ACCESS')) {
		isContainerViewAllowed = true;
		isContainerEditAllowed = false;
	}

	if (isDevice) {
		isContainerViewAllowed = data.DeviceOperation ? (data.DeviceOperation != AppConstants.get('NONE_OPERATION') ? isContainerViewAllowed : false) : isContainerViewAllowed;
		isContainerEditAllowed = data.DeviceOperation ? (data.DeviceOperation == AppConstants.get('READWRITE_OPERATION') ? isContainerEditAllowed : false) : isContainerEditAllowed;
	}

	obj.AllowView = isContainerViewAllowed;
	obj.AllowModify = isContainerEditAllowed;
	obj.AllowAdd = ((rootXml != undefined && rootXml.AllowAdd != undefined && (rootXml.AllowAdd).toUpperCase() == "TRUE") ? true : false);
	obj.AllowDelete = ((rootXml != undefined && rootXml.AllowDelete != undefined && (rootXml.AllowDelete).toUpperCase() == "TRUE") ? true : false);
	if (isUpdate == true || isUpdate == undefined) {
		obj.AllowEdit = ((rootXml != undefined && rootXml.AllowEdit != undefined && (rootXml.AllowEdit).toUpperCase() == "TRUE") ? true : false);
	} else {
		obj.AllowEdit = false;
	}
	obj.AllowSequence = ((rootXml != undefined && rootXml.AllowSequence != undefined && (rootXml.AllowSequence).toUpperCase() == "TRUE") ? true : false);

	obj.Container = generatePanelDataAddInstance(data, paramLevel, DeviceParamAppGID, rootXml, clickLevel, isUpdate, isContainerViewAllowed, isContainerEditAllowed, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, isDeviceSearch, koUtil, isDevice);
	tabContainer.push(obj);
}

function generatePanelDataAddInstance(data, paramLevel, DeviceParamAppGID, rootXml, clickLevel, isUpdate, isContainerViewAllowed, isContainerEditAllowed, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, isDeviceSearch, koUtil, isDevice) {
	var arr = new Array();
	var obj = new Object();
	obj.Name = data.Name;

	if (data.DisplayName != undefined) {
		if (data.DisplayName.indexOf('$APPGID$') !== -1) {
			if (DeviceParamAppGID != undefined && DeviceParamAppGID != '') {
				obj.DisplayName = data.DisplayName.replace("$APPGID$", DeviceParamAppGID);
			} else {
				obj.DisplayName = data.DisplayName;
			}
		} else {
			obj.DisplayName = data.DisplayName;
		}
	} else {
		if (data.Name.indexOf('$APPGID$') !== -1) {
			if (DeviceParamAppGID != undefined && DeviceParamAppGID != '') {
				obj.DisplayName = data.Name.replace("$APPGID$", DeviceParamAppGID);
			} else {
				obj.DisplayName = data.Name;
			}
		} else {
			obj.DisplayName = data.Name;
		}
	}

	obj.Access = data.Access != undefined ? data.Access : AppConstants.get('BASIC_ACCESS');
	obj.Type = data.Type != undefined ? data.Type : AppConstants.get('GENERAL');
	if (obj.DisplayName == AppConstants.get('DETAILS'))
		obj.Type = AppConstants.get('DETAILS');

	obj.AllowView = isContainerViewAllowed;
	obj.AllowModify = isContainerEditAllowed;
	obj.AllowAdd = ((rootXml != undefined && rootXml.AllowAdd != undefined && (rootXml.AllowAdd).toUpperCase() == "TRUE") ? true : false);
	obj.AllowDelete = ((rootXml != undefined && rootXml.AllowDelete != undefined && (rootXml.AllowDelete).toUpperCase() == "TRUE") ? true : false);
	if (isUpdate == true || isUpdate == undefined) {
		obj.AllowEdit = ((rootXml != undefined && rootXml.AllowEdit != undefined && (rootXml.AllowEdit).toUpperCase() == "TRUE") ? true : false);
	} else {
		obj.AllowEdit = false;
	}
	obj.AllowSequence = (rootXml != undefined && rootXml.AllowSequence != undefined && (rootXml.AllowSequence).toUpperCase() == "TRUE") ? true : false;

	paramLevel = paramLevel + 1;
	var cal = 0;
	cal = paramLevel;
	cal = cal * 2;
	obj.paramLevel = cal;
	if (data.Param != undefined) {
		if (data.Param.length == undefined)
			data.Param = $.makeArray(data.Param);

		for (var p = 0; p < data.Param.length; p++) {

			var isParamViewAllowed = false;
			var isParamEditAllowed = false;
			if (isContainerViewAllowed && isContainerEditAllowed) {
				if (data.Param[p].Access == AppConstants.get('BASIC_ACCESS')) {
					isParamViewAllowed = retvalForBasicParamView;
					isParamEditAllowed = retvalForBasicParamEdit;
				} else if (data.Param[p].Access == AppConstants.get('ADVANCED_ACCESS')) {
					isParamViewAllowed = retvalForAdvParamView;
					isParamEditAllowed = retvalForAdvParamEdit;
				} else if (data.Param[p].Access == AppConstants.get('VIEW_ACCESS')) {
					isParamViewAllowed = true;
					isParamEditAllowed = false;
				}
			} else if (isContainerViewAllowed && !isContainerEditAllowed) {
				if (data.Param[p].Access == AppConstants.get('BASIC_ACCESS')) {
					isParamViewAllowed = retvalForBasicParamView;;
				} else if (data.Param[p].Access == AppConstants.get('ADVANCED_ACCESS')) {
					isParamViewAllowed = retvalForAdvParamView;
				} else if (data.Param[p].Access == AppConstants.get('VIEW_ACCESS')) {
					isParamViewAllowed = true;
				}
				isParamEditAllowed = false;
			}
			if (data.Param[p].ValueType && data.Param[p].ValueType.Type == "File") {
				isParamEditAllowed = false;
			}

			if (data.Param[p].ParamId != undefined) {

			} else {
				data.Param[p]["ParamId"] = 0;
			}
			if (data.Param[p].DisplayName != undefined) {

			} else {
				data.Param[p]["DisplayName"] = data.Param[p].Name;
			}
			if (data.Param[p].Description != undefined) {

			} else {
				data.Param[p]["Description"] = 'N/A';
			}
			if (data.Param[p].ParamValue == undefined) {
				if (clickLevel != 0) {
					data.Param[p]["ParamValue"] = '';
				}
			}

			data.Param[p].Access = data.Param[p].Access != undefined ? data.Param[p].Access : AppConstants.get('BASIC_ACCESS');
			data.Param[p].AllowView = data.Param[p].Access != AppConstants.get('NONE_ACCESS') ? isParamViewAllowed : false;
			data.Param[p].AllowModify = data.Param[p].Access != AppConstants.get('NONE_ACCESS') ? isParamEditAllowed : false;
		}
		if (isUpdate == false) {
			obj.Param = _.where(data.Param, { SourceType: 'User' });
		} else if (koUtil.displayPrimaryIdentifiers == false) {
			for (var k = 0; k < data.Param.length; k++) {
				if (data.Param[k].PrimaryIdentifier == undefined || data.Param[k].PrimaryIdentifier == null) {
					data.Param[k].PrimaryIdentifier = 'False';
				}
			}
			obj.Param = _.where(data.Param, { PrimaryIdentifier: 'False' });
		} else {
			obj.Param = data.Param;
		}

	} else {
		obj.Param = [];
	}
	if (data.Container) {
		if (data.Container.length == undefined)
			data.Container = $.makeArray(data.Container);

		if (data.Container.length > 0) {
			var newarr = new Array();
			var cal = 0;
			for (var c = 0; c < data.Container.length; c++) {
				cal = 1;
				paramLevel = cal;
                data.Type = data.Type != undefined ? data.Type : AppConstants.get('DETAILS');
                if (data.Type == AppConstants.get('NORMAL') || data.Type == AppConstants.get('DETAILS')) {
					data.Container[c].Access = data.Container ? (data.Container[c].Access ? data.Container[c].Access : AppConstants.get('BASIC_ACCESS')) : AppConstants.get('BASIC_ACCESS');
				}

				isContainerViewAllowed = false;
				isContainerEditAllowed = false;
				if (data.Container[c].Access == AppConstants.get('BASIC_ACCESS')) {
					isContainerViewAllowed = retvalForBasicParamView;
					isContainerEditAllowed = retvalForBasicParamEdit;
				} else if (data.Container[c].Access == AppConstants.get('ADVANCED_ACCESS')) {
					isContainerViewAllowed = retvalForAdvParamView;
					isContainerEditAllowed = retvalForAdvParamEdit;
				} else if (data.Container[c].Access == AppConstants.get('VIEW_ACCESS')) {
					isContainerViewAllowed = true;
					isContainerEditAllowed = false;
				}

				if (isDevice) {
					isContainerViewAllowed = data.Container[c].DeviceOperation ? (data.Container[c].DeviceOperation != AppConstants.get('NONE_OPERATION') ? isContainerViewAllowed : false) : isContainerViewAllowed;
					isContainerEditAllowed = data.Container[c].DeviceOperation ? (data.Container[c].DeviceOperation == AppConstants.get('READWRITE_OPERATION') ? isContainerEditAllowed : false) : isContainerEditAllowed;
				}

				newarr.push(generatePanelDataAddInstance(data.Container[c], paramLevel, DeviceParamAppGID, rootXml, clickLevel, true, isContainerViewAllowed, isContainerEditAllowed, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, isDeviceSearch, koUtil));
			}
		}
		obj.Container = newarr;
		arr.push(obj);
		return arr;

	} else {
		obj.Container = [];
	}

	arr.push(obj);
	return arr;
}

function moveTabsLeft(mainHeaderId, leftId, rightId, length, left, contrWidth) {                      //When we move left
	var maxWidth = length * 110;
	if (left < 0 && contrWidth < maxWidth) {
		left = left + 110;
		$(mainHeaderId).css("margin-left", left + "px");
	}

	//for  Disable left right Button
	if (left == 0) {
		$(leftId).attr('disabled', true);
		if (contrWidth < maxWidth) {
			$(rightId).attr('disabled', false);
		}
	} else if (left <= 0 && left >= -(maxWidth - contrWidth)) {
		$(leftId).attr('disabled', false);
		$(rightId).attr('disabled', false);
	} else if (left <= -(maxWidth - contrWidth)) {
		$(rightId).attr('disabled', true);
		$(leftId).attr('disabled', false);
	}

	return left;
}

function moveTabsRight(mainHeaderId, leftId, rightId, length, left, contrWidth) {
	var maxWidth = length * 110;
	//When we move right
	if (left > -(maxWidth - contrWidth) && contrWidth < maxWidth) {
		left = left - 110;
		$(mainHeaderId).css("margin-left", left + "px");
	}

	//for  Disable left right Button
	if (contrWidth > maxWidth) {
		$(leftId).attr('disabled', true);
		$(rightId).attr('disabled', true);
	} else if (left == 0) {
		$(leftId).attr('disabled', true);
	} else if (left <= 0 && left >= -(maxWidth - contrWidth)) {
		$(leftId).attr('disabled', false);
		$(rightId).attr('disabled', false);
	} else if (left <= -(maxWidth - contrWidth)) {
		$(rightId).attr('disabled', true);
		$(leftId).attr('disabled', false);
	}

	return left;
}

function updateTabsNavigation(mainHeaderId, leftId, rightId, length, left, contrWidth) {
	var maxWidth = length * 110;
    $(mainHeaderId).css("margin-left", left + "px");
	//for  Disable left right Button
	if (contrWidth > maxWidth) {
		$(leftId).attr('disabled', true);
		$(rightId).attr('disabled', true);
	} else if (left <= 0 && left >= -(maxWidth - contrWidth)) {		
        $(rightId).attr('disabled', false);
        if (left == 0) {
            $(leftId).attr('disabled', true);
        } else {
            $(leftId).attr('disabled', false);
        }
	} else if (left <= -(maxWidth - contrWidth)) {
		$(rightId).attr('disabled', true);
		$(leftId).attr('disabled', false);
    } else if (left == 0) {
        $(leftId).attr('disabled', true);
    }
}
