import React, { Component } from "react";
import Clipboard from 'react-clipboard.js';
import PropTypes from 'prop-types'
import authHelper from '../helpers/authHelper';
import ddsClient from '../helpers/ddsClient';

class ManageKey extends Component {
  constructor(props) {
    super(props);
    this.confirmApiKeyDeletion = this.confirmApiKeyDeletion.bind(this);
    this.confirmApiKeyRegeneration = this.confirmApiKeyRegeneration.bind(this);
    this.generateUserApiKey = this.generateUserApiKey.bind(this);
    this.initializeUserApiKey = this.initializeUserApiKey.bind(this);
    this.ignoreKeyNotFoundException = this.ignoreKeyNotFoundException.bind(this);
    this.destroyUserApiKey = this.destroyUserApiKey.bind(this);
    this.handleSuccessfulBackendApiKeyDestruction = this.handleSuccessfulBackendApiKeyDestruction.bind(this);
    this.newUserApiKey = this.newUserApiKey.bind(this);
    this.handleCurrentUserApiKey = this.handleCurrentUserApiKey.bind(this);
  }

  componentWillMount() {
    if (this.props.userApiKey == null) {
      this.initializeUserApiKey();
    }
  }

  confirmApiKeyDeletion(event) {
    event.preventDefault();
    if(window.confirm("Warning, This is a Destructive Action!\nAll software agents which use this key will stop working!")) {
      this.destroyUserApiKey();
    }
  }

  confirmApiKeyRegeneration(event) {
    event.preventDefault();
    if(window.confirm("Warning, This is a Destructive Action!\nAll software agents which use the original key will stop working!")) {
      this.newUserApiKey();
    }
  }

  generateUserApiKey(event) {
    event.preventDefault();
    this.newUserApiKey();
  }

  initializeUserApiKey() {
    var jwtToken = authHelper.jwt();
    ddsClient.getUserApiKey(
      jwtToken,
      this.handleCurrentUserApiKey,
      this.ignoreKeyNotFoundException
    );
  }

  ignoreKeyNotFoundException(errorMessage) {
    if(errorMessage.error != "404") {
      this.handleException(errorMessage);
    }
  }

  destroyUserApiKey() {
    var jwtToken = authHelper.jwt();
    ddsClient.destroyUserApiKey(
      jwtToken,
      this.handleSuccessfulBackendApiKeyDestruction,
      this.handleException
    );
  }

  handleSuccessfulBackendApiKeyDestruction() {
    this.props.destroyUserApiKey();
  }

  newUserApiKey() {
    var jwtToken = authHelper.jwt();
    ddsClient.setUserApiKey(
      jwtToken,
      this.handleCurrentUserApiKey,
      this.handleException
    )
  }

  handleException(errorMessage) {
    alert(JSON.stringify(errorMessage));
  }

  handleCurrentUserApiKey(key) {
    this.props.setUserApiKey(key);
  }

  notifyClipboardCopy() {
    alert("ApiKey Successfully Copied to Clipboard!")
  }

  render() {
    if (this.props.userApiKey == null) {
      return (
        <div>
          <button id="generate_user_api_key" onClick={this.generateUserApiKey}>Generate Key</button>
        </div>
      )
    }
    else {
      return (
        <div>
          <button id="destroy_user_api_key" onClick={this.confirmApiKeyDeletion}>Destroy</button>
          <br />
          <button id="regenerate_user_api_key" onClick={this.confirmApiKeyRegeneration}>Regenerate</button>
          <Clipboard id="access_user_api_key" option-text={() => this.props.userApiKey} onSuccess={this.notifyClipboardCopy}>copy to clipboard</Clipboard>
        </div>
      )
    }
  }
}
ManageKey.propTypes = {
  userApiKey: PropTypes.string,
  setUserApiKey: PropTypes.func.isRequired,
  destroyUserApiKey: PropTypes.func.isRequired
};
export default ManageKey;
