import React, { Component } from "react";
import PropTypes from 'prop-types'
import ManageKey from "./ManageKey"
import uuidv1 from "uuid";

class UserKey extends Component {
  constructor(props) {
    super(props);
    this.confirmApiKeyDeletion = this.confirmApiKeyDeletion.bind(this);
    this.confirmApiKeyRegeneration = this.confirmApiKeyRegeneration.bind(this);
    this.generateUserApiKey = this.generateUserApiKey.bind(this);
  }

  componentDidMount() {
    if (this.props.currentUser == null) {
      this.newCurrentUser();
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

  newCurrentUser() {
    const newU = uuidv1();
    this.props.setCurrentUser(newU)
  }

  render() {
    let keyDisplay;
    if(this.props.userApiKey == null) {
      keyDisplay = <button onClick={this.generateUserApiKey}>Generate Key</button>
    }
    else {
      keyDisplay = <ManageKey destroyKey={this.confirmApiKeyDeletion} regenerateKey={this.confirmApiKeyRegeneration} apiKey={this.props.userApiKey} />
    }
    return (
      <div>
        <p>User { this.props.currentUser } Key { this.props.userApiKey }</p>
        {keyDisplay}
      </div>
    )
  }
}

UserKey.propTypes = {
  userApiKey: PropTypes.string,
  currentUser: PropTypes.string,
  setCurrentUser: PropTypes.func.isRequired,
  setUserApiKey: PropTypes.func.isRequired,
  destroyUserApiKey: PropTypes.func.isRequired
}
export default UserKey;
