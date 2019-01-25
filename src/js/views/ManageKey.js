import React, { Component } from "react";
import Clipboard from 'react-clipboard.js';
import PropTypes from 'prop-types';
import { Button, IconAddCircle, IconTrashcan, IconWarning } from 'dracs';

import authHelper from '../helpers/authHelper';
import ddsClient from '../helpers/ddsClient';
require("../../stylesheets/styles.css"); //this must be declared last for style cascade to work properly

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
    this.handleException = this.handleException.bind(this);
    this.state = {};
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
    if (this.refs.manage_key_rendered) {
      this.setState({hasError: errorMessage});
    }
  }

  handleCurrentUserApiKey(key) {
    this.props.setUserApiKey(key);
  }

  notifyClipboardCopy() {
    alert("ApiKey Successfully Copied to Clipboard!")
  }

  render() {
    if (this.state.hasError){
      alert(JSON.stringify(this.state.hasError));
    }

    if (this.props.userApiKey == null) {
      return (
        <div className="item-row" ref="manage_key_rendered">
          <IconAddCircle size={20} color="#7ED321" /><Button id="generate_user_api_key" onClick={this.generateUserApiKey} label="Generate Key" type="raised" autoFocus />
        </div>
      )
    }
    else {
      return (
        <div className="item-row" ref="manage_key_rendered">
          <span className="item-row"><IconTrashcan size={20} /><Button id="destroy_user_api_key" onClick={this.confirmApiKeyDeletion} label="Destroy" type="raised" autoFocus /></span>
          <span className="item-row"><IconWarning size={20} /><Button id="regenerate_user_api_key" onClick={this.confirmApiKeyRegeneration} label="Regenerate" type="raised" autoFocus /></span>
          <span className="item-row"><Clipboard id="access_user_api_key" option-text={() => this.props.userApiKey} onSuccess={this.notifyClipboardCopy}>Copy to Clipboard</Clipboard></span>
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
