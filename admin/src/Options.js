import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDotCircle, faSpinner, faCheck, faSkull, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-regular-svg-icons'
import styles from './Options.module.css'
import sharedStyles from './App.module.css'
import classnames from 'classnames'
import { isEqual } from 'lodash'
import SvgPseudoElementsWarning from "./SvgPseudoElementsWarning";

const UNSPECIFIED = ''
const REQUIRE_FORBID_OPTIONS = ['require', 'forbid', UNSPECIFIED]

class Options extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      technology: UNSPECIFIED,
      v4compat: UNSPECIFIED,
      svgPseudoElements: UNSPECIFIED,
      version: UNSPECIFIED,
      usePro: false,
      removeUnregisteredClients: false,
      versionOptions: null,
      lastProps: null
    }

    this.handleMethodSelect = this.handleMethodSelect.bind(this)
    this.handleProCheck = this.handleProCheck.bind(this)
    this.handleV4Select = this.handleV4Select.bind(this)
    this.handlePseudoElementsSelect = this.handlePseudoElementsSelect.bind(this)
    this.handleVersionSelect = this.handleVersionSelect.bind(this)
    this.handleRemoveUnregisteredCheck = this.handleRemoveUnregisteredCheck.bind(this)
    this.handleSubmitClick = this.handleSubmitClick.bind(this)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if( nextProps.isSubmitting || isEqual(prevState.lastProps, nextProps) ) {
      return null
    }

    const newState = {
      lastProps: nextProps,
      svgPseudoElements: nextProps.currentOptions.svgPseudoElements || UNSPECIFIED,
      version: nextProps.currentOptions.version || UNSPECIFIED,
      v4compat: nextProps.currentOptions.v4compat || UNSPECIFIED,
      technology: nextProps.currentOptions.technology,
      usePro: !!nextProps.currentOptions.usePro,
      removeUnregisteredClients: !!nextProps.currentOptions.removeUnregisteredClients,
      versionOptions: Options.buildVersionOptions(nextProps)
    }

    return newState
  }

  static buildVersionOptions(props) {
    const { releases: { available, latest_version, previous_version } } = props

    return available.reduce((acc, version) => {
      if( latest_version === version ) {
        acc[version] = `${ version } (latest)`
      } else if ( previous_version === version ) {
        acc[version] = `${ version } (previous minor release)`
      } else {
        acc[version] = version
      }
      return acc
    }, { [UNSPECIFIED]: '-' })
  }

  handleMethodSelect(e){
    this.setState({ technology: e.target.value === '-' ? UNSPECIFIED : e.target.value })
  }

  handleVersionSelect(e){
    this.setState({ version: e.target.value === '-' ? UNSPECIFIED : e.target.value })
  }

  handlePseudoElementsSelect(e){
    this.setState({ pseudoElements: e.target.value === '-' ? UNSPECIFIED : e.target.value })
  }

  handleProCheck(){
    this.setState({ usePro: !this.state.usePro })
  }

  handleRemoveUnregisteredCheck(){
    this.setState({ removeUnregisteredClients: !this.state.removeUnregisteredClients })
  }

  handleV4Select(e){
    this.setState({ v4compat: e.target.value === '-' ? UNSPECIFIED : e.target.value })
  }

  handleSubmitClick(e) {
    e.preventDefault()

    const { putData } = this.props

    putData({
      options: {
        technology: this.state.technology === UNSPECIFIED ? undefined : this.state.technology,
        v4compat: this.state.v4compat === UNSPECIFIED ? undefined : this.state.v4compat,
        svgPseudoElements: this.state.pseudoElements === UNSPECIFIED ? undefined : this.state.pseudoElements,
        version: this.state.version === UNSPECIFIED ? undefined : this.state.version,
        usePro: this.state.usePro,
        removeUnregisteredClients: this.state.removeUnregisteredClients
      }
    })
  }

  render() {
    if(this.state.error) throw this.state.error

    const { hasSubmitted, isSubmitting, submitSuccess, submitMessage } = this.props

    const { technology, v4compat, pseudoElements } = this.state

    return <div className={ classnames(styles['options-setter']) }>
        {
          'require' === pseudoElements
          && 'svg' === technology
          && <SvgPseudoElementsWarning
              v4compat={ 'require' === v4compat }
              showModal={ this.props.showPseudoElementsHelpModal }
          />
        }
        <form onSubmit={ e => e.preventDefault() }>
          <div className={ classnames( sharedStyles['flex'], sharedStyles['flex-row'] ) }>
            <div className={ styles['option-header'] }>Technology</div>
            <div className={ classnames(styles['option-value'], sharedStyles['flex'], sharedStyles['flex-row']) }>
              <div>
                <input
                  id="code_edit_tech_webfont"
                  name="code_edit_tech"
                  type="radio"
                  value="webfont"
                  checked={ technology === 'webfont' }
                  onChange={ () => this.setState({ technology: 'webfont' }) }
                  className={ classnames(sharedStyles['sr-only'], sharedStyles['input-radio-custom']) }
                />
                <label htmlFor="code_edit_tech_webfont" className={ styles['option-label'] }>
                  <span className={ sharedStyles['relative'] }>
                    <FontAwesomeIcon
                      icon={ faDotCircle }
                      size="lg"
                      fixedWidth
                      className={ sharedStyles['checked-icon'] }
                    />
                    <FontAwesomeIcon
                      icon={ faCircle }
                      size="lg"
                      fixedWidth
                      className={ sharedStyles['unchecked-icon'] }
                    />
                  </span>
                  <span className={ styles['option-label-text'] }>
                    Web Font
                  </span>
                </label>
              </div>
              <div>
                  <input
                    id="code_edit_tech_svg"
                    name="code_edit_tech"
                    type="radio"
                    value="svg"
                    checked={ technology === 'svg' }
                    onChange={ () => this.setState({ technology: 'svg' }) }
                    className={ classnames(sharedStyles['sr-only'], sharedStyles['input-radio-custom']) }
                  />
                  <label htmlFor="code_edit_tech_svg" className={ styles['option-label'] }>
                    <span className={ sharedStyles['relative'] }>
                      <FontAwesomeIcon
                        icon={ faDotCircle }
                        className={ sharedStyles['checked-icon'] }
                        size="lg"
                        fixedWidth
                      />
                      <FontAwesomeIcon
                        icon={ faCircle }
                        className={ sharedStyles['unchecked-icon'] }
                        size="lg"
                        fixedWidth
                      />
                    </span>
                    <span className={ styles['option-label-text'] }>
                      SVG
                    </span>
                  </label>
                </div>
            </div>
          </div>
        </form>
        <table className="form-table">
        <tbody>
          <tr>
            <th scope="row">
              <label htmlFor="use-pro">Use Pro</label>
            </th>
            <td>
              <input name="use-pro" checked={ this.state.usePro } value={ this.state.usePro } type="checkbox" onChange={ this.handleProCheck }/>
              <span className={styles["label-hint"]}>
                Requires a subscription.
                <a rel="noopener noreferrer" target="_blank" href="https://fontawesome.com/pro"><FontAwesomeIcon icon={faExternalLinkAlt} /> Learn more</a>
                <a rel="noopener noreferrer" target="_blank" href="https://fontawesome.com/account/cdn"><FontAwesomeIcon icon={faExternalLinkAlt} /> Manage my allowed domains</a>
              </span>
            </td>
          </tr>
          <tr>
            <th scope="row">
              <label htmlFor="v4compat">Version 4 Compatibility</label>
            </th>
            <td>
              <select name="v4compat" onChange={ this.handleV4Select } value={ this.state.v4compat }>
                {
                  REQUIRE_FORBID_OPTIONS.map((option, index) => {
                    return <option key={ index } value={ option }>{ option ? option : '-' }</option>
                  })
                }
              </select>
            </td>
          </tr>
          <tr>
            <th scope="row">
              <label htmlFor="pseudo-elements">Pseudo-elements Support</label>
            </th>
            <td>
              <select name="pseudo-elements" onChange={ this.handlePseudoElementsSelect } value={ this.state.pseudoElements }>
                {
                  REQUIRE_FORBID_OPTIONS.map((option, index) => {
                    return <option key={ index } value={ option }>{ option ? option : '-' }</option>
                  })
                }
              </select>
            </td>
          </tr>
          <tr>
            <th scope="row">
              <label htmlFor="version">Version</label>
            </th>
            <td>
              <select name="version" onChange={ this.handleVersionSelect } value={ this.state.version }>
                {
                  Object.keys(this.state.versionOptions).map((version, index) => {
                    return <option key={ index } value={ version }>
                      { version === UNSPECIFIED ? '-' : this.state.versionOptions[version] }
                    </option>
                  })
                }
              </select>
              {
                this.props.releaseProviderStatus && this.props.releaseProviderStatus.code !== 200 &&
                <div className={ styles['release-provider-error'] }>
                  { this.props.releaseProviderStatus.message }
                </div>
              }
            </td>
          </tr>
          <tr>
            <th scope="row">
              <label htmlFor="remove-unregistered">Remove unregistered clients</label>
            </th>
            <td>
              <input
                name="remove-unregistered"
                checked={ this.state.removeUnregisteredClients }
                value={ this.state.removeUnregisteredClients }
                type="checkbox"
                onChange={ this.handleRemoveUnregisteredCheck }
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div className="submit">
        <input
          type="submit"
          name="submit"
          id="submit"
          className="button button-primary"
          value="Save Changes"
          onClick={ this.handleSubmitClick }
        />
        { hasSubmitted &&
          ( submitSuccess
            ? <span className={ classnames(styles['submit-status'], styles['success']) }>
                <FontAwesomeIcon className={ styles['icon'] } icon={ faCheck } />
                <span className={ styles['explanation'] }>
                  { submitMessage }
                </span>
              </span>
            : <div className={ classnames(styles['submit-status'], styles['fail']) }>
                <div className={ classnames(styles['fail-icon-container']) }>
                  <FontAwesomeIcon className={ styles['icon'] } icon={ faSkull } />
                </div>
                <div className={ styles['explanation'] }>
                  { submitMessage }
                </div>
              </div>
          )
        }
        {isSubmitting &&
          <span className={ classnames(styles['submit-status'], styles['submitting']) }>
            <FontAwesomeIcon className={ styles['icon'] } icon={faSpinner} spin/>
          </span>
        }
      </div>
    </div>

  }
}

export default Options

Options.propTypes = {
  putData: PropTypes.func.isRequired,
  currentOptions: PropTypes.object.isRequired,
  releases: PropTypes.object.isRequired,
  releaseProviderStatus: PropTypes.object,
}
