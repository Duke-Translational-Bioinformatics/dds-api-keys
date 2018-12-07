import Axios from "axios";
import authHelper from "./authHelper";
import jwtDecode from "jwt-decode";

let idleTimeInMin = 0;
const timeOutLimit = 240;
const idleTickTimeInMin = 10;
let authSuccessCallback = () => {};

function incrementIdle() {
  idleTimeInMin += idleTickTimeInMin;
  if (idleTimeInMin >= timeOutLimit) {
    sessionHelper.logOut("idleTimeout");
  }
}

function resetIdle() {
  idleTimeInMin = 0;
}

function initializeIdleTracking() {
  resetIdle();
  setInterval(incrementIdle, idleTickTimeInMin * 60 * 1000);
  window.onclick = resetIdle;
}

function setExpiry(timeout) {
  const expiry = Date.now() + (timeout - 300) * 1000;
  return expiry;
}

function getExpiryTimeInMS() {
  const expiryInMS = sessionStorage.getItem("jwtTimeout") - Date.now();
  return expiryInMS;
}

function handleNewAuthentication(userToken, timeout, netid) {
  sessionStorage.setItem("userJWT", userToken);
  sessionStorage.setItem("jwtTimeout", setExpiry(timeout));
  if (netid) {
    sessionStorage.setItem("netid", netid);
  }
  authSuccessCallback();
  setClientToken(userToken);
}

function getToken() {
  return sessionStorage.getItem("userJWT");
}

var sessionHelper = {
  checkSession(handleSessionExists) {
    if (!sessionStorage.getItem("userJWT")) {
      authHelper.login();
    } else {
      handleSessionExists();
    }
  },
  getUser() {
    return sessionStorage.getItem("netid");
  },
  createSession(handleAuthSuccess, handleHasToken) {
    authSuccessCallback = handleAuthSuccess;
    if (authHelper.tokenExists()) {
      if (handleHasToken) {
        handleHasToken();
      }
      initializeIdleTracking();
      authHelper.validateAuthentication(handleNewAuthentication, () => {
        sessionHelper.logOut("createSession failure");
      });
    } else {
      authHelper.login();
    }
  },
  serviceGet(url, handleSuccess, handleFailure) {
    Axios({
      url: url,
      dataType: "json",
      method: "GET",
      headers: { Authorization: getToken() },
      timeout: 60000
    })
      .then(function({ data, headers }) {
        handleSuccess(data, headers);
      })
      .catch(function(response) {
        handleFailure(response);
      });
  },
  serviceGetWithParams(url, params, handleSuccess, handleFailure) {
    Axios({
      url: url,
      dataType: "json",
      method: "GET",
      headers: { Authorization: getToken() },
      timeout: 60000,
      params: params,
    })
      .then(function({ data, headers }) {
        handleSuccess(data, headers);
      })
      .catch(function(response) {
        handleFailure(response);
      });
  },
  servicePost(
    url,
    payload,
    handleSuccess,
    handleFailure
  ) {
    let options = {
      dataType: "json",
      headers: { Authorization: getToken() },
      timeout: 60000,
    };

    Axios.post(url, payload, options)
      .then(({ data }) => {
        handleSuccess(data);
      })
      .catch(response => {
        handleFailure(response);
      });
  },
  servicePut(url, payload, handleSuccess, handleFailure) {
    Axios.put(url, payload, {
      dataType: "json",
      headers: { Authorization: getToken() },
      timeout: 60000,
    })
      .then(({ data }) => {
        handleSuccess(data);
      })
      .catch(response => {
        handleFailure(response);
      });
  },
  serviceDelete(url, handleSuccess, handleFailure) {
    Axios.delete(url, {
      dataType: "json",
      headers: { Authorization: getToken() },
      timeout: 60000,
    })
      .then(({ data }) => {
        handleSuccess(data);
      })
      .catch(response => {
        handleFailure(response);
      });
  },
  serviceDeleteWithParams(url, params, handleSuccess, handleFailure) {
    Axios.delete(url, {
      data: params,
      dataType: "json",
      headers: { Authorization: getToken() },
      timeout: 60000,
    })
      .then(({ data }) => {
        handleSuccess(data);
      })
      .catch(response => {
        handleFailure(response);
      });
  },
};

export default sessionHelper;
