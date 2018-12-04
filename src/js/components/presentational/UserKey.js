import React, { Component } from "react";

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
    return (
      <div>
        <p>User { this.state.currentUser } Key { this.state.apiKey }</p>
        <button onClick={this.confirmApiKeyDeletion} type="submit" className="btn btn-success btn-lg">
          Destroy
        </button>
        <button onClick={this.confirmApiKeyRegeneration} type="submit" className="btn btn-success btn-lg">
          Regenerate
        </button>
      </div>
    )
  }
}
export default UserKey;
