import React, { Component } from "react";
import PropTypes from 'prop-types'
import UserKey from "../controllers/UserKey"
import { AppHeader, H4, P, Spinner } from 'dracs';
import authHelper from '../helpers/authHelper';
import ddsClient from '../helpers/ddsClient';

class CurrentUser extends Component {
  constructor(props) {
    super(props);
    this.handleAuthenticationSuccess = this.handleAuthenticationSuccess.bind(this);
    this.handleCurrentUser = this.handleCurrentUser.bind(this);
    this.ignorePrematureCallException = this.ignorePrematureCallException.bind(this);
    this.handleException = this.handleException.bind(this);
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
    if (this.refs.current_user_rendered) {
      this.setState({hasError: errorMessage});
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
        <div ref="current_user_rendered">
          <AppHeader
            backgroundImage=""
            childrenLeft={<H4 bold color="#FFFFFF">Duke Data Service User Secret</H4>}
            childrenRight={null}
            height={46}
            fixed
            mediaQuery=""
            raised={false}
            rightIcon={<P color="#FFFFFF">{ this.props.currentUser.full_name }</P>}
            onRightIconClick={null}
            leftIcon={null}
            onLeftIconClick={null}
            backgroundColor="#0680CD"
            width="calc(100% - 70px)"
          />
          <UserKey />
        </div>
      )
    }
    else {
      return (
        <div ref="current_user_rendered">
          <AppHeader
            backgroundImage=""
            childrenLeft={<H4 bold color="#FFFFFF">Duke Data Service User Secret</H4>}
            childrenRight={null}
            height={46}
            fixed
            mediaQuery=""
            raised={false}
            rightIcon={null}
            onRightIconClick={null}
            leftIcon={null}
            onLeftIconClick={null}
            backgroundColor="#0680CD"
            width="calc(100% - 70px)"
          />
          <P color="F5A623">Initializing </P>
          <Spinner />
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
