import React, { Component } from "react";
import Clipboard from 'react-clipboard.js';
import PropTypes from 'prop-types';
import {
  Button,
  IconAddCircle,
  IconTrashcan,
  IconWarning,
  IconDetails,
  IconShare,
  IconAddCircleFilled,
  IconCloseCircleFilled,
  H4,P,
  Modal, Dialog,
  List, SingleLineListItem,
  theme
 } from 'dracs';

 const buttonSpacing = {
   margin: "8px"
 };

 const buttonIconSpacing = {
   margin: "-4px 4px 0 0"
 }

 const iconSpanStyle = {
   display: "flex",
   flex: "1 1 auto",
   justifyContent: "center",
   alignItems: "center",
 };


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
      this.setState({hasError: false, errorMessage: undefined});
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
    let apiProblemNotification = <Modal
      id="key_api_problem_notification"
      active={this.state.hasError}
      onEscKeyDown={this.acknowlegeException}
    >
      <H4>A Problem has occurred</H4>
      <P>{JSON.stringify(this.state.errorMessage)}</P>
      <Button onClick={this.acknowlegeException} label="OK" />
    </Modal>;

    if (this.props.userApiKey == null) {
      return (
        <div className="item-row" ref="manage_key_rendered">
          {apiProblemNotification}
          <Button
            id="generate_user_api_key"
            onClick={this.generateUserApiKey}
            label={
              <span style={iconSpanStyle}>
                <IconAddCircle style={iconSpanStyle} size={20} color="#7ED321" />Generate Key
              </span>
            }
            style={buttonSpacing}
            type="raised"
            autoFocus />
        </div>
      )
    }
    else {
      let deletionConfirmationDialog = <Dialog
        id="deletion_confirmation_dialog"
        active={this.state.needsDeletionConfirmation}
        title="Warning, This is a Destructive Action"
        actions={[
          {label: 'Cancel', onClick: this.cancelKeyDestruction},
          {label: 'Continue', onClick: this.destroyUserApiKey}
        ]}
      >
        <P>All software agents which use this key will stop working!"</P>
      </Dialog>;
      let regenerationConfirmationDialog = <Dialog
        id="regeneration_confirmation_dialog"
        active={this.state.needsRegenerationConfirmation}
        title="Warning, This is a Destructive Action"
        actions={[
          {label: 'Cancel', onClick: this.cancelKeyRegeneration},
          {label: 'Continue', onClick: this.newUserApiKey}
        ]}
      >
        <P>All software agents which use the original key will stop working!</P>
      </Dialog>;
      let keyCopiedNotification = <Modal
        id="key_copied_notification"
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

            <Button
              id="destroy_user_api_key"
              onClick={this.confirmApiKeyDeletion}
              label={
                <span style={iconSpanStyle}>
                  <IconCloseCircleFilled style={buttonIconSpacing} size={20} />Destroy
                </span>
              }
              style={buttonSpacing}
              type="raised"
              autoFocus
            />
            <Button
              style={buttonSpacing}
              id="regenerate_user_api_key"
              onClick={this.confirmApiKeyRegeneration}
              label={<span style={iconSpanStyle}><IconAddCircleFilled style={buttonIconSpacing} size={20} />Regenerate</span>}
              type="raised"
            />
            <Clipboard
              className="clipboard-button"
              style={buttonSpacing}
              id="access_user_api_key"
              option-text={() => this.props.userApiKey}
              onSuccess={this.notifyClipboardCopy}
            >
             <span style={iconSpanStyle}>
               <IconDetails style={buttonIconSpacing} size={20} color={theme.colors.action}  />Copy to Clipboard
             </span>
           </Clipboard>
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
