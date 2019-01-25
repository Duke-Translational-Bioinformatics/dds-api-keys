import React, { Component } from "react";
import PropTypes from 'prop-types'
import UserKey from "../controllers/UserKey"
import { Card, CardHeader, CardBody, H4, P, Spinner } from 'dracs';
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
          <Card height="400px" width="400px" raised>
            <CardHeader
              border
              className=""
              dragHandle={false}
              htmlTitle={false}
              icon={<div className="item-row"><H4 bold color="#FFFFFF">Duke Data Service User Secret</H4><P className="header-title" color="#FFFFFF">{ this.props.currentUser.full_name }</P></div>}
              style={{
                maxWidth: "384px",
                backgroundColor: "#0680CD"
              }}
              title=""
            />
            <CardBody
              className=""
              id=""
              padding=""
              style={{}}
            >
              <UserKey />
            </CardBody>
          </Card>
        </div>
      )
    }
    else {
      return (
        <div ref="current_user_rendered">
          <Card height="400px" width="400px" raised>
            <CardHeader
              border
              className=""
              dragHandle={false}
              htmlTitle={false}
              icon={<H4 bold color="#FFFFFF">Duke Data Service User Secret</H4>}
              style={{
                maxWidth: "384px",
                backgroundColor: "#0680CD"
              }}
              title=""
            />
            <CardBody
              className=""
              id=""
              padding=""
              style={{}}
            >
              <P>Initializing ... <Spinner /></P>
            </CardBody>
          </Card>
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
