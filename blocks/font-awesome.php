<?php
/**
 * Functions to register client-side assets (scripts and stylesheets) for the
 * Gutenberg block.
 *
 * @package font-awesome
 */

/**
 * Registers all block assets so that they can be enqueued through Gutenberg in
 * the corresponding context.
 *
 * @see https://wordpress.org/gutenberg/handbook/blocks/writing-your-first-block-type/#enqueuing-block-scripts
 */
function font_awesome_block_init() {
	// Skip block registration if Gutenberg is not enabled/merged.
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}
	$dir = dirname( __FILE__ );

	$index_js = 'font-awesome/block.build.js';
	wp_register_script(
		'font-awesome-block-editor',
		plugins_url( $index_js, __FILE__ ),
		array(
			'wp-blocks',
			'wp-i18n',
			'wp-element',
			'wp-components',
			'wp-editor'
		),
		filemtime( "$dir/$index_js" )
	);

	$editor_css = 'font-awesome/editor.css';
	wp_register_style(
		'font-awesome-block-editor',
		plugins_url( $editor_css, __FILE__ ),
		array(),
		filemtime( "$dir/$editor_css" )
	);

	$style_css = 'font-awesome/style.css';
	wp_register_style(
		'font-awesome-block',
		plugins_url( $style_css, __FILE__ ),
		array(),
		filemtime( "$dir/$style_css" )
	);

	register_block_type( 'font-awesome/font-awesome', array(
		'editor_script' => 'font-awesome-block-editor',
		'editor_style'  => 'font-awesome-block-editor',
		'style'         => 'font-awesome-block',
	) );
}
add_action( 'wp_loaded', 'font_awesome_block_init' );
