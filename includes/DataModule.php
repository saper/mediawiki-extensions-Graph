<?php
/**
 * ResourceLoader module providing extra data to the client-side.
 *
 * @file
 * @ingroup Extensions
 */

namespace Graph;

use ResourceLoader;
use ResourceLoaderContext;
use ResourceLoaderModule;

class DataModule extends ResourceLoaderModule {

	protected $targets = array( 'desktop', 'mobile' );

	public function getScript( ResourceLoaderContext $context ) {
		$config = $context->getResourceLoader()->getConfig();
		return ResourceLoader::makeConfigSetScript( array(
			'wgGraphHttpDomains' => $config->get( 'GraphHttpDomains' ),
			'wgGraphHttpsDomains' => $config->get( 'GraphHttpsDomains' ),
			'wgGraphIsTrusted' => $config->get( 'GraphIsTrusted' ),
		) );
	}

	public function enableModuleContentVersion() {
		return true;
	}
}
