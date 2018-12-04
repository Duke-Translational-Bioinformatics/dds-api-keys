import React, { Component } from "react";

class UserKey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: 'darin',
      apiKey: 'abc123'
    };
    this.confirmDeletion = this.confirmDeletion.bind(this);
    this.handleConfirmation = this.handleConfirmation.bind(this);
  }
  confirmDeletion() {
    if(window.confirm("Warning, This is a Destructive Action!\nAll software agents which use this key will stop working!")) {
      this.handleConfirmation()
    }
  }

  handleConfirmation() {
    alert("Confirmed by UserKey")
  }
  render() {
    return (
      <div>
        <p>Hello { this.state.currentUser }</p>
        <button onClick={this.confirmDeletion} type="submit" className="btn btn-success btn-lg">
          Destroy
        </button>
      </div>
    )
  }
}
export default UserKey;
