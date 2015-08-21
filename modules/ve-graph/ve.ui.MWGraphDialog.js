/*!
 * VisualEditor UserInterface MWGraphDialog class.
 *
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * MediaWiki graph dialog.
 *
 * @class
 * @extends ve.ui.NodeDialog
 *
 * @constructor
 * @param {Object} [element]
 */
ve.ui.MWGraphDialog = function VeUiMWGraphDialog() {
	// Parent constructor
	ve.ui.MWGraphDialog.super.apply( this, arguments );

	// Properties
	this.graphModel = null;
	this.cachedRawData = null;
	this.changingJsonTextInput = false;
};

/* Inheritance */

OO.inheritClass( ve.ui.MWGraphDialog, ve.ui.NodeDialog );

/* Static properties */

ve.ui.MWGraphDialog.static.name = 'graph';

ve.ui.MWGraphDialog.static.title = OO.ui.deferMsg( 'graph-ve-dialog-edit-title' );

ve.ui.MWGraphDialog.static.icon = 'code';

ve.ui.MWGraphDialog.static.size = 'large';

ve.ui.MWGraphDialog.static.actions = [
	{
		action: 'apply',
		label: OO.ui.deferMsg( 'graph-ve-dialog-edit-apply' ),
		flags: [ 'progressive', 'primary' ],
		modes: 'edit'
	},
	{
		label: OO.ui.deferMsg( 'graph-ve-dialog-edit-cancel' ),
		flags: 'safe',
		modes: [ 'edit', 'insert' ]
	}
];

ve.ui.MWGraphDialog.static.modelClasses = [ ve.dm.MWGraphNode ];

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.MWGraphDialog.prototype.getBodyHeight = function () {
	// FIXME: This should depend on the dialog's content.
	return 500;
};

/**
 * @inheritdoc
 */
ve.ui.MWGraphDialog.prototype.initialize = function () {
	var graphTypeField, jsonTextField;

	// Parent method
	ve.ui.MWGraphDialog.super.prototype.initialize.call( this );

	/* Root layout */
	this.rootLayout = new OO.ui.BookletLayout( {
		classes: [ 've-ui-mwGraphDialog-panel-root' ],
		outlined: true
	} );

	this.generalPage = new OO.ui.PageLayout( 'general' );
	this.rawPage = new OO.ui.PageLayout( 'raw' );

	this.rootLayout.addPages( [
		this.generalPage, this.rawPage
	] );

	/* Graph type page */
	this.generalPage.getOutlineItem()
		.setIcon( 'parameter' )
		.setLabel( ve.msg( 'graph-ve-dialog-edit-page-general' ) );

	this.graphTypeDropdownInput = new OO.ui.DropdownInputWidget();

	graphTypeField = new OO.ui.FieldLayout( this.graphTypeDropdownInput, {
		label: ve.msg( 'graph-ve-dialog-edit-field-graph-type' )
	} );

	this.unknownGraphTypeWarningLabel = new OO.ui.LabelWidget( {
		label: ve.msg( 'graph-ve-dialog-edit-unknown-graph-type-warning' )
	} );

	this.generalPage.$element.append(
		graphTypeField.$element,
		this.unknownGraphTypeWarningLabel.$element
	);

	/* Raw JSON page */
	this.rawPage.getOutlineItem()
		.setIcon( 'code' )
		.setLabel( ve.msg( 'graph-ve-dialog-edit-page-raw' ) );

	this.jsonTextInput = new ve.ui.WhitespacePreservingTextInputWidget( {
		autosize: true,
		classes: [ 've-ui-mwGraphDialog-json' ],
		maxRows: 25,
		multiline: true,
		validate: this.validateRawData
	} );

	// Make sure JSON is LTR
	this.jsonTextInput.setRTL( false );

	jsonTextField = new OO.ui.FieldLayout( this.jsonTextInput, {
		label: ve.msg( 'graph-ve-dialog-edit-field-raw-json' ),
		align: 'top'
	} );

	this.rawPage.$element.append( jsonTextField.$element );

	// Event handlers
	this.jsonTextInput.connect( this, {
		change: 'onSpecStringInputChange'
	} );

	this.graphTypeDropdownInput.connect( this, {
		change: 'onGraphTypeInputChange'
	} );

	// Initialization
	this.$body.append( this.rootLayout.$element );
};

/**
 * @inheritdoc
 */
ve.ui.MWGraphDialog.prototype.getSetupProcess = function ( data ) {
	var spec;

	return ve.ui.MWGraphDialog.super.prototype.getSetupProcess.call( this, data )
		.next( function () {
			// Set up model
			spec = this.selectedNode.getSpec();

			this.graphModel = new ve.dm.MWGraphModel( spec );
			this.graphModel.connect( this, {
				specChange: 'onSpecChange'
			} );

			// Set up default values
			this.setupFormValues();

			// If parsing fails here, cached raw data can simply remain null
			try {
				this.cachedRawData = JSON.parse( this.jsonTextInput.getValue() );
			} catch ( err ) {}

			this.checkChanges();
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.MWGraphDialog.prototype.getTeardownProcess = function () {
	return ve.ui.MWGraphDialog.super.prototype.getTeardownProcess.call( this )
		.first( function () {
			// Kill model
			this.graphModel.disconnect( this );
			this.graphModel = null;
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.MWGraphDialog.prototype.getActionProcess = function ( action ) {
	switch ( action ) {
		case 'apply':
			return new OO.ui.Process( function () {
				this.graphModel.applyChanges( this.selectedNode, this.getFragment().getSurface() );
				this.close( { action: action } );
			}, this );

		default:
			return ve.ui.MWGraphDialog.super.prototype.getActionProcess.call( this, action );
	}
};

/**
 * Setup initial values in the dialog
 *
 * @private
 */
ve.ui.MWGraphDialog.prototype.setupFormValues = function () {
	var graphType = this.graphModel.getGraphType(),
		options = [
			{
				data: 'bar',
				label: ve.msg( 'graph-ve-dialog-edit-type-bar' )
			},
			{
				data: 'area',
				label: ve.msg( 'graph-ve-dialog-edit-type-area' )
			},
			{
				data: 'line',
				label: ve.msg( 'graph-ve-dialog-edit-type-line' )
			}
		],
		unknownGraphTypeOption = {
			data: 'unknown',
			label: ve.msg( 'graph-ve-dialog-edit-type-unknown' )
		};

	// JSON text input
	this.jsonTextInput.setValue( this.graphModel.getSpecString() );

	// Graph type
	if ( graphType === 'unknown' ) {
		options.push( unknownGraphTypeOption );
	}

	this.graphTypeDropdownInput
		.setOptions( options )
		.setValue( graphType );
};

/**
 * Validate raw data input
 *
 * @private
 * @param {string} value The new input value
 */
ve.ui.MWGraphDialog.prototype.validateRawData = function ( value ) {
	var isValid = !$.isEmptyObject( ve.dm.MWGraphNode.static.parseSpecString( value ) ),
		label = ( isValid ) ? '' : ve.msg( 'graph-ve-dialog-edit-json-invalid' );

	this.setLabel( label );

	return isValid;
};

/**
 * React to spec string input change
 *
 * @private
 * @param {string} value The text input value
 */
ve.ui.MWGraphDialog.prototype.onSpecStringInputChange = function ( value ) {
	var newRawData;

	try {
		// If parsing fails here, nothing more needs to happen
		newRawData = JSON.parse( value );

		// Only pass changes to model if there was anything worthwhile to change
		if ( !OO.compare( this.cachedRawData, newRawData ) ) {
			this.cachedRawData = newRawData;
			this.graphModel.setSpecFromString( value );
		}
	} catch ( err ) {}
};

/**
 * React to graph type changes
 *
 * @param {string} [value] The new graph type
 */
ve.ui.MWGraphDialog.prototype.onGraphTypeInputChange = function ( value ) {
	this.unknownGraphTypeWarningLabel.toggle( value === 'unknown' );

	if ( value !== 'unknown' ) {
		this.graphModel.switchGraphType( value );
	}
};

/**
 * React to spec change
 *
 * @private
 */
ve.ui.MWGraphDialog.prototype.onSpecChange = function () {
	this.jsonTextInput.setValue( this.graphModel.getSpecString() );

	this.checkChanges();
};

/**
 * Check for overall validity and enables/disables action abilities accordingly
 *
 * @private
 */
ve.ui.MWGraphDialog.prototype.checkChanges = function () {
	var self = this,
		hasModelBeenChanged = this.graphModel.hasBeenChanged(),
		areChangesValid;

	this.jsonTextInput.isValid().done( function ( isJsonTextInputValid ) {
		areChangesValid = ( hasModelBeenChanged && isJsonTextInputValid );
		self.actions.setAbilities( { apply: areChangesValid } );
	} );
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.MWGraphDialog );
