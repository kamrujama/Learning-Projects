define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
    var lang = getSysLang();

    return function modelDeleteContentLibrary() {
      
        //focus on first textbox
        $('#viewgroupEstablishMentModal').on('shown.bs.modal', function () {
            $('#btnGroupID').focus();
        })        

        $('#viewgroupEstablishMentModal').keydown(function (e) {
            if ($('#btnGroupID').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#btnDeleteGroup').focus();
            }
        });

        var self = this;
        self.deleteGroupCount = ko.observable();
        var deleteCount = getAllSelectedDataCount('jqxgridGroupEstablishment');
       
        $("#deleteCount").text(i18n.t('are_you_sure_you_want_to_delete_selected_group', { deleteGroupCount: deleteCount }, { lng: lang }))
        $("#deleteCountNote").text(i18n.t('delete_grp_note', { lng: lang }));


        $('#DeleteGroupEstablishmentContent').mouseup(function () {
            $("#DeleteGroupEstablishment").draggable({ disabled: true });
        });

        $('#DeleteGroupEstablishmentContent').mousedown(function () {
            $("#DeleteGroupEstablishment").draggable({ disabled: false });
        });





        //click on yes button to delete library
        self.deleteLibrary = function (observableModelPopup) {
            var selecteItemIds = '';
            var selecteItemIds = '';
            if (globalVariableFordeleteGroupEstablishmnet[0].checkAll == 1) {
                selecteItemIds = null;
                unSelectedIds = globalVariableFordeleteGroupEstablishmnet[0].unSelecedRowID;
            } else {
                selecteItemIds = globalVariableFordeleteGroupEstablishmnet[0].selectedRowID;
                unSelectedIds = null;
            }
            deletePackage(selecteItemIds, unSelectedIds, observableModelPopup);
        }

        seti18nResourceData(document, resourceStorage);
    };

    // for delete library
    function deletePackage(selecteItemIds, unSelectedIds, observableModelPopup) {

        var deleteGroupReq = new Object();
        var Selector = new Object();
        Selector.SelectedItemIds = selecteItemIds;
        Selector.UnSelectedItemIds = unSelectedIds;

        deleteGroupReq.Selector = Selector;
        deleteGroupReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'groups_delete_success');
                    gridRefreshClearSelection("jqxgridGroupEstablishment");
                    observableModelPopup('unloadTemplate');
                } 
            }
        }
        var method = 'DeleteGroup';
        var params = '{"token":"' + TOKEN() + '","deleteGroupReq":' + JSON.stringify(deleteGroupReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }
});