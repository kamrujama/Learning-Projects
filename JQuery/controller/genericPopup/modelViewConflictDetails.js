define(["knockout", "autho", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, autho, koUtil) {
    return function appViewModel() {

        var self = this;
        $('#modelViewConflictDetailsHeader').mouseup(function () {
            $("#modelViewConflictDetailsContent").draggable({ disabled: true });
        });

        $('#modelViewConflictDetailsHeader').mousedown(function () {
            $("#modelViewConflictDetailsContent").draggable({ disabled: false });
        });
        $("#paramConflictmessage").text(conflictHierarchyParameters.InfoMessage );
        //------display conflict details data------
        function jqxgridViewConflicts(data, gID) {
            // prepare the data
            var source =
            {
                dataType: "json",
                localdata: data,
                datafields: [
                    { name: 'TemplateName', map: 'TemplateName' },
                    { name: 'ReferenceSet', map: 'ReferenceSet' },
                    { name: 'HierarchyPath', map: 'HierarchyPath' },
                    { name: 'Application', map: 'Application' },
                    { name: 'Package', map: 'Package' },
                    { name: 'Version', map: 'Version' },
                ],
            };
            var dataAdapter = new $.jqx.dataAdapter(source);
            var buildFilterPanel = function (filterPanel, datafield) {
                wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
            }
            this.gID = $('#jqxgridViewConflictDetails');
            $("#" + gID).jqxGrid(
            {
                width: "100%",
                source: dataAdapter,
                sortable: true,
                filterable: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                altrows: true,
                autoshowcolumnsmenubutton: false,
                showsortmenuitems: false,
                editable: true,
                rowsheight: 32,
                enabletooltips: true,
                columnsResize: true,
                columns: [
                     {
                         text: i18n.t('pt_hierarchy_templatename', { lng: lang }), datafield: 'TemplateName', width: 'auto', minwidth: 120, editable: false, menu: false, sortable: false, filterable: false,
                     },
                      {
                          text: i18n.t('pt_hierarchy_applicationname', { lng: lang }), datafield: 'Application', width: 'auto', minwidth: 100, editable: false, menu: false, sortable: false, filterable: false,
                      },
                     {
                         text: i18n.t('pt_hierarchy_applicationversion', { lng: lang }), datafield: 'Version', width: 'auto', minwidth: 100, editable: false, menu: false, sortable: false, filterable: false,
                     },
                    {
                        text: i18n.t('pt_hierarchy_packagename', { lng: lang }), datafield: 'Package', width: 'auto', minwidth: 100, editable: false, menu: false, sortable: false, filterable: false,
                    },
                      {
                        text: i18n.t('pt_hierarchy_referencesetname', { lng: lang }), datafield: 'ReferenceSet', width: 'auto', minwidth: 100, editable: false, menu: false, sortable: false, filterable: false,
                   },
                    {
                         text: i18n.t('pt_hierarchy_hierarchypath', { lng: lang }), datafield: 'HierarchyPath', width: 'auto', minwidth: 180, editable: false, menu: false, sortable: false, filterable: false,
                   },
                  
                ]
            })

        }
        jqxgridViewConflicts(conflictHierarchyParameters.TemplateHierarchyReferenceSet, 'jqxgridViewConflictDetails');
        seti18nResourceData(document, resourceStorage);
    }
});