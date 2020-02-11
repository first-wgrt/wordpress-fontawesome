<?php
/**
 * This module is not considered part of the public API, only internal.
 * Any data or functionality that it produces should be exported by the
 * main FontAwesome class and the API documented and semantically versioned there.
 */
namespace FortAwesome;

use \WP_Error, \Error, \Exception, \InvalidArgumentException;

require_once trailingslashit( FONTAWESOME_DIR_PATH ) . 'includes/class-fontawesome-api-settings.php';

/**
 * Provides metadata about Font Awesome icons.
 *
 * Internal use only. Not part of this plugin's public API.
 *
 * @internal
 */
class FontAwesome_Metadata_Provider {
	/**
	 * Singleton instance.
	 *
	 * @internal
	 */
	protected static $instance = null;

	/**
	 * Post method that wraps wp_remote_post.
	 *
	 * Internal use only. Not part of this plugin's public API.
	 *
	 * @internal
	 */
	protected function post( $url, $args = array() ) {
		return wp_remote_post( $url, $args );
	}

	/**
	 * Returns the FontAwesome_Metadata_Provider singleton instance.
	 *
	 * Internal use only. Not part of this plugin's public API.
	 *
	 * @return FontAwesome_Metadata_Provider
	 * @internal
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Resets the singleton instance referenced by this class and returns that new instance.
	 * All previous releases metadata held in the previous instance will be abandoned.
	 *
	 * Internal use only. Not part of this plugin's public API.
	 *
	 * @return FontAwesome_Metadata_Provider
	 */
	public static function reset() {
		self::$instance = null;
		return self::instance();
	}

	/**
	 * Returns query errors if there was a problem querying the
	 * graphql api in a readable string.
	 *
	 * @ignore
	 */
	protected function query_errors( $errors ) {
		$error_string = '';

		foreach ( $errors as $error ) {
			$error_string .= $error['message'];
		}

		return $error_string;
	}

	/**
	 * Queries the GraphQL API and returns the response body when the HTTP status
	 * of the response is 200.
	 *
	 * Internal use only. Not part of this plugin's public API.
	 *
	 * External code should use {@see FontAwesome::query()} instead.
	 *
	 * @param $ignore_auth when TRUE this will omit an authorization header on
	 *     the network request, even if an apiToken is present.
	 * @ignore
	 * @internal
	 * @return string json encoded query response body
	 */
	public function metadata_query( $query_string, $ignore_auth = FALSE ) {
		$args = array(
			'method'  => 'POST',
			'headers' => array(
				'Content-Type' => 'application/json',
			),
			'body'    => '{"query": ' . json_encode( $query_string ) . '}',
		);

		if( ! $ignore_auth ) {
			$access_token = $this->current_access_token();
			if ( $access_token instanceof WP_Error ) {
				return $access_token;
			} elseif ( is_string( $access_token ) ) {
				$args['headers']['authorization'] = "Bearer $access_token";
			}
		}

		try {
			$response = $this->post( FONTAWESOME_API_URL, $args );

			if ( $response instanceof WP_Error ) {
				return $response;
			}

			if ( 200 === $response['response']['code'] ) {
				return $response['body'];
			} else {
				return new WP_Error(
					'fontawesome_api_failed_request',
					$response['response']['message'],
					array( 'status' => $response['response']['code'] )
				);
			}
		} catch ( Exception $e ) {
			return new WP_Error(
				'fontawesome_exception',
				$e->getMessage()
			);
		} catch ( Error $e ) {
			return new WP_Error(
				'fontawesome_error',
				$e->getMessage()
			);
		}
	}

	/**
	 * Returns a current access_token, if available. Attempts to refresh an
	 * access_token if the one we have is near or past expiration and an api_token
	 * is present.
	 * 
	 * Returns WP_Error indicating any error when trying to refresh an access_token.
	 * Returns null when there is no api_token.
	 * Otherwise, returns the current access_token as a string.
	 * 
	 * @return WP_Error|string|null access_token if available; null if unavailable,
	 *    or WP_Error if there is an error while refreshing the access_token.
	 */
	protected function current_access_token() {
		if ( ! boolval( fa_api_settings()->api_token() ) ) {
			return null;
		}
		
		$exp = fa_api_settings()->access_token_expiration_time();
		$access_token = fa_api_settings()->access_token();

		if ( is_string( $access_token ) && $exp > ( time() - 5 ) ) {
			return $access_token;
		} else {
			// refresh the access token
			$result = fa_api_settings()->request_access_token();

			if( $result instanceof WP_Error ) {
				return $result;
			} else {
				return fa_api_settings()->access_token();
			}
		}
	}
}

/**
 * Convenience global function to get a singleton instance of the Metadata Provider.
 *
 * Internal use only. Not part of this plugin's public API.
 *
 * @see FontAwesome_Metadata_Provider::instance()
 * @return FontAwesome_Metadata_Provider
 * @internal
 */
function fa_metadata_provider() {
	return FontAwesome_Metadata_Provider::instance();
}
