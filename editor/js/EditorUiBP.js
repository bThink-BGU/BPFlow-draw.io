//
// //defining our own EditorUi, which extends the graph editor original EditorUi
//
// EditorUIBP = function(editor, container, lightbox) {
//
//     EditorUi.call(this, editor, container, lightbox);
// };
//
// EditorUIBP.prototype = Object.create(EditorUi.prototype);
//
// EditorUIBP.prototype.createFormat = function(container){
//
//     return new FormatBP(this,container);
// };
//
// EditorUIBP.prototype.constructor = EditorUi;
EditorUiBP.prototype.preDebugActions = []

function EditorUiBP(editor, container, lightbox) {
    EditorUi.call(this,editor, container, lightbox);
};

EditorUiBP.prototype = Object.create(EditorUi.prototype);


EditorUiBP.prototype.createHoverIcons = function()
{
    return new HoverIconsBP(this.editor.graph);
};

//
EditorUiBP.prototype.createFormat = function(container)
{
    return new FormatBP(this, container);
};


EditorUiBP.prototype.createToolbar = function(container)
{
    new ActionsBP(this.actions);
    return new ToolbarBP(this, container);
};

EditorUiBP.prototype.createSidebar = function(container)
{
    return new SidebarBP(this, container);
};


/**
 * Creates a temporary graph instance for rendering off-screen content.
 */
EditorUiBP.prototype.createTemporaryGraph = function(stylesheet)
{
    var graph = new GraphBP(document.createElement('div'), null, null, stylesheet);
    graph.resetViewOnRootChange = false;
    graph.setConnectable(false);
    graph.gridEnabled = false;
    graph.autoScroll = false;
    graph.setTooltips(false);
    graph.setEnabled(false);

    // Container must be in the DOM for correct HTML rendering
    graph.container.style.visibility = 'hidden';
    graph.container.style.position = 'absolute';
    graph.container.style.overflow = 'hidden';
    graph.container.style.height = '1px';
    graph.container.style.width = '1px';

    return graph;
};

// Disables all the actions in the editor except debugging actions
EditorUiBP.prototype.disableActionsForDebugging = function () {

    var actions = Object.values(this.actions.actions);
    EditorUiBP.prototype.preDebugActions = [];

    for (var i = 0; i < actions.length; i++) {
        EditorUiBP.prototype.preDebugActions.push([actions[i], actions[i].isEnabled()])
        actions[i].setEnabled(false);
    }

    actions = ['debug_stop', 'debug_next', 'showConsole'];
    for (var i = 0; i < actions.length; i++) {
        this.actions.get(actions[i]).setEnabled(true);
    }
}

// Enables all the actions in the editor (which were enabled before the debugging) except debugging actions
EditorUiBP.prototype.enableActionsAfterDebugging = function () {

    for (var i = 0; i < EditorUiBP.prototype.preDebugActions.length; i++) {
        var action = EditorUiBP.prototype.preDebugActions[i];
        action[0].setEnabled(action[1]);
    }

    actions = ['debug_stop', 'debug_next', 'debug_back'];
    for (var i = 0; i < actions.length; i++) {
        this.actions.get(actions[i]).setEnabled(false);
    }
}

// Closes the side menus in order to prevent graph changes during the execution display
EditorUiBP.prototype.startDebugging = function () {
    this.editor.graph.clearSelection();
    this.disableActionsForDebugging();
    this.toggleFormatPanel(true);
    this.diagramContainer.style.left = '0px';
    this.hsplit.style.visibility = 'hidden';
    this.sidebarContainer.style.visibility = 'hidden';
}

// Opens the sidebar menu and fixes the working sheet's location
EditorUiBP.prototype.endDebugging = function () {
    this.enableActionsAfterDebugging();
    this.sidebarContainer.style.visibility = 'visible';
    this.hsplit.style.visibility = 'visible';
    this.toggleFormatPanel();
    this.resetScrollbars();
}

// Disables the redo and undo buttons
EditorUiBP.prototype.noUndoRedo = function () {
    this.actions.get('undo').setEnabled(false);
    this.actions.get('redo').setEnabled(false);
}

// Enables/Disables the debug_back button
EditorUiBP.prototype.enableDebugBack = function (bool) {
    this.actions.get('debug_back').setEnabled(bool);
}

// Enables/Disables the debug_next button
EditorUiBP.prototype.enableDebugNext = function (bool) {
    this.actions.get('debug_next').setEnabled(bool);
}

EditorUiBP.prototype.saveFile = function(forceDialog)
{
    if (!forceDialog && this.editor.filename != null)  // save ..
    {
        this.save(this.editor.getOrCreateFilename());
    }
    else    //save as ..
    {
        ExportDialog.saveLocalFile(this, mxUtils.getXml(this.editor.getGraphXml()), this.editor.getOrCreateFilename(), "xml");
    }
};

// Sets the graph view to horizontal view withput putting the action in the undoManger
EditorUiBP.prototype.fixView = function() {
    var graph = this.editor.graph;
    var cells = Object.values(graph.model.cells);
    graph.setSelectionCells(cells);
    new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST).execute(graph.getDefaultParent(), graph.getSelectionCells());
    graph.clearSelection();
}