import React, { Component } from "react";
import PropTypes from 'prop-types'
import UserKey from "../controllers/UserKey"
import authHelper from '../helpers/authHelper';
import ddsClient from '../helpers/ddsClient';

class CurrentUser extends Component {
  constructor(props) {
    super(props);
    this.handleAuthenticationSuccess = this.handleAuthenticationSuccess.bind(this);
    this.handleCurrentUser = this.handleCurrentUser.bind(this);
    this.ignorePrematureCallException = this.ignorePrematureCallException.bind(this);
    this.state = {};
  }

  componentDidMount() {
    if (!authHelper.isLoggedIn()) {
      authHelper.login().then(
        this.handleAuthenticationSuccess,
        this.handleException
      );
    }
  }

  handleException(errorMessage) {
    if (this.refs.renderedRef) {
      this.setState({hasError: JSON.stringify(errorMessage)});
    }
  }

  handleAuthenticationSuccess(isSuccessful) {
    var jwtToken = authHelper.jwt();
    ddsClient.getCurrentUser(
      jwtToken,
      this.handleCurrentUser,
      this.ignorePrematureCallException
    )
  }

  ignorePrematureCallException(errorMessage) {
    //as the async call to login is resolving, getCurrentUser
    //gets called with a null jwt, which will not happen
    //when the login fully resolves
    //this handler ignores this call, and allows the page to reload
    //when the login fully resolves.
    if (authHelper.jwt()) {
      this.handleException(errorMessage);
    }
  }

  handleCurrentUser(user) {
    this.props.setCurrentUser(user);
  }

  render() {
    if (this.state.hasError){
      alert(JSON.stringify(this.state.hasError));
    }
    if (authHelper.isLoggedIn()) {
      return (
        <div ref="renderedRef">
          <p>User { this.props.currentUser.full_name }</p>
          <UserKey />
        </div>
      )
    }
    else {
      return (
        <div ref="renderedRef">
          <p>Fetching User</p>
        </div>
      )
    }
  }
}

CurrentUser.propTypes = {
  currentUser: PropTypes.object,
  setCurrentUser: PropTypes.func.isRequired
}
export default CurrentUser;
