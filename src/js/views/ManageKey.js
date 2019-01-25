import React, { Component } from "react";
import Clipboard from 'react-clipboard.js';
import PropTypes from 'prop-types';
import { Button, IconAddCircle, IconTrashcan, IconWarning, IconShare, H4, P, Modal, Dialog } from 'dracs';

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
    this.acknowlegeException = this.acknowlegeException.bind(this);
    this.cancelKeyDestruction = this.cancelKeyDestruction.bind(this);
    this.cancelKeyRegeneration = this.cancelKeyRegeneration.bind(this);
    this.acknowlegeKeyCopied = this.acknowlegeKeyCopied.bind(this);
    this.notifyClipboardCopy = this.notifyClipboardCopy.bind(this);
    this.state = {
      hasError: false,
      errorMessage: null,
      needsDeletionConfirmation: false,
      needsRegenerationConfirmation: false,
      keyCopiedToClipboard: false
    };
  }

  componentWillMount() {
    if (this.props.userApiKey == null) {
      this.initializeUserApiKey();
    }
  }

  confirmApiKeyDeletion(event) {
    event.preventDefault();
    if (this.refs.manage_key_rendered) {
      this.setState({
        needsDeletionConfirmation: true
      });
    }
  }

  cancelKeyDestruction() {
    if (this.refs.manage_key_rendered && this.state.needsDeletionConfirmation) {
      this.setState({
        needsDeletionConfirmation: false
      });
    }
  }

  confirmApiKeyRegeneration(event) {
    event.preventDefault();
    if (this.refs.manage_key_rendered) {
      this.setState({
        needsRegenerationConfirmation: true
      });
    }
  }

  cancelKeyRegeneration() {
    if (this.refs.manage_key_rendered && this.state.needsRegenerationConfirmation) {
      this.setState({
        needsRegenerationConfirmation: false
      });
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
    this.cancelKeyDestruction();
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
      this.setState({
        hasError: true,
        errorMessage: errorMessage
      });
    }
  }

  acknowlegeException() {
    if (this.refs.manage_key_rendered) {
      this.setState({hasError: false, errorMessage: null});
    }
  }

  handleCurrentUserApiKey(key) {
    this.props.setUserApiKey(key);
    this.cancelKeyRegeneration();
  }

  notifyClipboardCopy() {
    if (this.refs.manage_key_rendered) {
      this.setState({
        keyCopiedToClipboard: true
      })
    }
  }

  acknowlegeKeyCopied() {
    if (this.refs.manage_key_rendered) {
      this.setState({
        keyCopiedToClipboard: false
      })
    }
  }

  render() {
    let apiProblemNotification = <Modal active={this.state.hasError}>
      <H4>A Problem has occurred</H4>
      <P>{JSON.stringify(this.state.errorMessage)}</P>
      <Button onClick={this.acknowlegeException} label="OK" />
    </Modal>;

    if (this.props.userApiKey == null) {
      return (
        <div className="item-row" ref="manage_key_rendered">
          {apiProblemNotification}
          <IconAddCircle size={20} color="#7ED321" /><Button id="generate_user_api_key" onClick={this.generateUserApiKey} label="Generate Key" type="raised" autoFocus />
        </div>
      )
    }
    else {
      let deletionConfirmationDialog = <Dialog active={this.state.needsDeletionConfirmation}
        title="Warning, This is a Destructive Action"
        actions={[
          {label: 'Cancel', onClick: this.cancelKeyDestruction},
          {label: 'Continue', onClick: this.destroyUserApiKey}
        ]}
      >
        <P>All software agents which use this key will stop working!"</P>
      </Dialog>;
      let regenerationConfirmationDialog = <Dialog active={this.state.needsRegenerationConfirmation}
        title="Warning, This is a Destructive Action"
        actions={[
          {label: 'Cancel', onClick: this.cancelKeyRegeneration},
          {label: 'Continue', onClick: this.newUserApiKey}
        ]}
      >
        <P>All software agents which use the original key will stop working!</P>
      </Dialog>;
      let keyCopiedNotification = <Modal
        active={this.state.keyCopiedToClipboard}
        onEscKeyDown={this.acknowlegeKeyCopied}
      >
        <P>User Secret Successfully Copied to Clipboard!</P>
        <Button onClick={this.acknowlegeKeyCopied} label="OK" />
      </Modal>;

      return (
        <div ref="manage_key_rendered">
          {apiProblemNotification}
          {deletionConfirmationDialog}
          {regenerationConfirmationDialog}
          {keyCopiedNotification}
          <span className="item-row"><IconTrashcan size={20} /><Button id="destroy_user_api_key" onClick={this.confirmApiKeyDeletion} label="Destroy" type="raised" autoFocus /></span>
          <span className="item-row"><IconWarning size={20} /><Button id="regenerate_user_api_key" onClick={this.confirmApiKeyRegeneration} label="Regenerate" type="raised" autoFocus /></span>
          <span className="item-row"><IconShare size={20} /><Clipboard id="access_user_api_key" option-text={() => this.props.userApiKey} onSuccess={this.notifyClipboardCopy}>Copy to Clipboard</Clipboard></span>
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
