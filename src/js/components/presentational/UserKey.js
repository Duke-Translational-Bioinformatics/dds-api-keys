import React, { Component } from "react";
import ManageKey from "./ManageKey"
class UserKey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: 'darin',
      apiKey: null
    };
    this.confirmApiKeyDeletion = this.confirmApiKeyDeletion.bind(this);
    this.confirmApiKeyRegeneration = this.confirmApiKeyRegeneration.bind(this);
    this.destroyUserApiKey = this.destroyUserApiKey.bind(this);
    this.setUserApiKey = this.setUserApiKey.bind(this);
    this.getUserApiKey = this.getUserApiKey.bind(this);
  }

  confirmApiKeyDeletion() {
    if(window.confirm("Warning, This is a Destructive Action!\nAll software agents which use this key will stop working!")) {
      this.destroyUserApiKey()
    }
  }

  confirmApiKeyRegeneration() {
    if(window.confirm("Warning, This is a Destructive Action!\nAll software agents which use the original key will stop working!")) {
      this.setUserApiKey();
    }
  }

  destroyUserApiKey() {
    this.setState(state => ({
      apiKey: null
    }));
  }

  setUserApiKey() {
    this.setState(state => ({
      apiKey: '123abc'
    }))
  }

  getUserApiKey() {
    return this.state.apiKey
  }

  notifyClipboardCopy() {
    alert("ApiKey Successfully Copied to Clipboard!")
  }

  render() {
    let keyDisplay;
    if(this.state.apiKey == null) {
      keyDisplay = <button onClick={this.setUserApiKey}>Generate Key</button>
    }
    else {
      keyDisplay = <ManageKey destroyKey={this.confirmApiKeyDeletion} regenerateKey={this.confirmApiKeyRegeneration} getKey={this.getUserApiKey} handleSuccessfulClipboardCopy={this.notifyClipboardCopy} />
    }
    return (
      <div>
        <p>User { this.state.currentUser } Key { this.state.apiKey }</p>
        {keyDisplay}
      </div>
    )
  }
}
export default UserKey;
