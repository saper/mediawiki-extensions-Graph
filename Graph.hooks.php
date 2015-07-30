<?php
/**
 * Graph extension Hooks
 *
 * @file
 * @ingroup Extensions
 */

class GraphHooks {
	/**
	 * Conditionally register the ext.graph.VisualEditor module if VisualEditor
	 * has been loaded
	 *
	 * @param ResourceLoader $resourceLoader
	 * @return boolean true
	 */
	public static function onResourceLoaderRegisterModules( ResourceLoader &$resourceLoader ) {
		$resourceModules = $resourceLoader->getConfig()->get( 'ResourceModules' );

		$graphModuleTemplate = array(
			'localBasePath' => __DIR__,
			'remoteExtPath' => 'Graph'
		);

		$addModules = array(
			'ext.graph.visualEditor' => $graphModuleTemplate + array(
				'scripts' => array(
					'modules/ve-graph/ve.dm.MWGraphModel.js',
					'modules/ve-graph/ve.dm.MWGraphNode.js',
					'modules/ve-graph/ve.ce.MWGraphNode.js',
					'modules/ve-graph/ve.ui.MWGraphDialog.js',
					'modules/ve-graph/ve.ui.MWGraphDialogTool.js'
				),
				'dependencies' => array(
					'ext.visualEditor.mwcore',
					'ext.graph'
				),
				'messages' => array(
					'graph-ve-dialog-edit-apply',
					'graph-ve-dialog-edit-cancel',
					'graph-ve-dialog-edit-field-raw-json',
					'graph-ve-dialog-edit-json-invalid',
					'graph-ve-dialog-edit-title',
					'graph-ve-dialog-button-tooltip',
					'graph-ve-no-spec',
					'graph-ve-vega-error',
					'graph-ve-vega-error-no-render'
				),
				'targets' => array(
					'mobile', 'desktop'
				)
			)
		);

		if ( isset( $resourceModules[ 'ext.visualEditor.mwcore' ] ) || $resourceLoader->isModuleRegistered( 'ext.visualEditor.mwcore' ) ) {
			$resourceLoader->register( $addModules );
		}

		return true;
	}

	/**
	 * Conditionally register the unit testing module for the ext.graph.visualEditor module
	 * only if that module is loaded
	 *
	 * @param array $testModules The array of registered test modules
	 * @param ResourceLoader $resourceLoader The reference to the resource laoder
	 * @return true
	 */
	public static function onResourceLoaderTestModules( array &$testModules, ResourceLoader &$resourceLoader ) {
		$resourceModules = $resourceLoader->getConfig()->get( 'ResourceModules' );

		if ( isset( $resourceModules[ 'ext.graph.visualEditor' ] ) || $resourceLoader->isModuleRegistered( 'ext.graph.visualEditor' ) ) {
			$testModules['qunit']['ext.graph.visualEditor.test'] = array(
				'scripts' => array(
					'modules/ve-graph/tests/ext.graph.visualEditor.test.js'
				),
				'dependencies' => array(
					'ext.graph.visualEditor'
				),
				'localBasePath' => __DIR__,
				'remoteExtPath' => 'Graph'
			);
		}

		return true;
	}
}
