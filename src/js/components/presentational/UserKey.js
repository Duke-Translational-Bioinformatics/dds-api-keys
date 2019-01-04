import React, { Component } from "react";
import PropTypes from 'prop-types'
import ApiKey from "../container/ApiKey"
import authHelper from '../../helpers/authHelper';
import ddsClient from '../../helpers/ddsClient';

class UserKey extends Component {
  constructor(props) {
    super(props);
    this.handleAuthenticationSuccess = this.handleAuthenticationSuccess.bind(this);
    this.handleCurrentUser = this.handleCurrentUser.bind(this);
  }

  componentWillMount() {
    if (!authHelper.isLoggedIn()) {
      authHelper.login().then(
        this.handleAuthenticationSuccess,
        this.handleException
      );
    }
  }

  handleAuthenticationSuccess(isSuccessful) {
    var jwtToken = authHelper.jwt();
    ddsClient.getCurrentUser(
      jwtToken,
      this.handleCurrentUser,
      this.handleException
    )
  }

  handleCurrentUser(user) {
    this.props.setCurrentUser(user);
  }

  render() {
    if (authHelper.isLoggedIn()) {
      return (
        <div>
          <p>User { this.props.currentUser.full_name }</p>
          <ApiKey />
        </div>
      )
    }
    else {
      return (
        <div>
          <p>Fetching User</p>
        </div>
      )
    }
  }
}

UserKey.propTypes = {
  currentUser: PropTypes.object,
  setCurrentUser: PropTypes.func.isRequired
}
export default UserKey;
