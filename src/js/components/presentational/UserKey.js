import React, { Component } from "react";
import PropTypes from 'prop-types'
import ManageKey from "./ManageKey"
import authHelper from '../../helpers/authHelper';
import ddsClient from '../../helpers/ddsClient';

class UserKey extends Component {
  constructor(props) {
    super(props);
    this.confirmApiKeyDeletion = this.confirmApiKeyDeletion.bind(this);
    this.confirmApiKeyRegeneration = this.confirmApiKeyRegeneration.bind(this);
    this.generateUserApiKey = this.generateUserApiKey.bind(this);
    this.authenticateUser = this.authenticateUser.bind(this);
    this.handleAuthenticationSuccess = this.handleAuthenticationSuccess.bind(this);
    this.handleCurrentUser = this.handleCurrentUser.bind(this);
  }

  componentDidMount() {
    if (this.props.currentUser == null) {
      this.authenticateUser();
    }
  }

  confirmApiKeyDeletion(event) {
    event.preventDefault();
    if(window.confirm("Warning, This is a Destructive Action!\nAll software agents which use this key will stop working!")) {
      this.props.destroyUserApiKey();
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

  newUserApiKey() {
    const newKey = uuidv1();
    this.props.setUserApiKey(newKey)
  }

  authenticateUser() {
    authHelper.login().then(
      this.handleAuthenticationSuccess,
      this.handleException
    );
  }

  handleAuthenticationSuccess(isSuccessful) {
    var jwtToken = authHelper.jwt();
    var currentUser = ddsClient.getCurrentUser(
      jwtToken,
      this.handleCurrentUser,
      this.handleException
    )
  }

  handleException(errorMessage) {
    alert(JSON.stringify(errorMessage));
  }

  handleCurrentUser(user) {
    this.props.setCurrentUser(user);
  }

  render() {
    let userDisplay;
    let keyDisplay;
    if(this.props.currentUser == null) {
      userDisplay = <p>Fetching User</p>;
      keyDisplay = <p></p>
    }
    else {
      userDisplay = <p>User { this.props.currentUser.full_name }</p>
      if(this.props.userApiKey == null) {
        keyDisplay = <button onClick={this.generateUserApiKey}>Generate Key</button>
      }
      else {
        keyDisplay = <ManageKey destroyKey={this.confirmApiKeyDeletion} regenerateKey={this.confirmApiKeyRegeneration} apiKey={this.props.userApiKey} />
      }
    }
    return (
      <div>
        {userDisplay}
        {keyDisplay}
      </div>
    )
  }
}

UserKey.propTypes = {
  userApiKey: PropTypes.string,
  currentUser: PropTypes.object,
  setCurrentUser: PropTypes.func.isRequired,
  setUserApiKey: PropTypes.func.isRequired,
  destroyUserApiKey: PropTypes.func.isRequired
}
export default UserKey;
