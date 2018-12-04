import React, { Component } from "react";
import ManageKey from "./ManageKey"
class UserKey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: 'darin',
      apiKey: 'abc123'
    };
    this.confirmApiKeyDeletion = this.confirmApiKeyDeletion.bind(this);
    this.confirmApiKeyRegeneration = this.confirmApiKeyRegeneration.bind(this);
    this.destroyUserApiKey = this.destroyUserApiKey.bind(this);
    this.setUserApiKey = this.setUserApiKey.bind(this);
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

  render() {
    let keyDisplay;
    if(this.state.apiKey == null) {
      keyDisplay = <button onClick={this.setUserApiKey} type="submit" className="btn btn-success btn-lg">Generate Key</button>
    }
    else {
      keyDisplay = <ManageKey destroy={this.confirmApiKeyDeletion} regenerate={this.confirmApiKeyRegeneration} />
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
