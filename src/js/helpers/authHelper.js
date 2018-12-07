import Axios from "axios";
import ddsClient from './ddsClient'

function getOauthCodeFromURI() {
  if (window.location.href.indexOf("#") > 0) {
    const parts = window.location.search.slice(1).split("&");
    const oauthCode = parts[0].split("=")[1];
    return oauthCode;
  }
}

function redirectToOauth() {
  let dukeOauthUrl = `${providerInfo.provider_uri}?response_type=${
    providerInfo.response_type
  }&client_id=${providerInfo.client_id}&state=login&redirect_uri=${
    providerInfo.redirect_uri
  }`;
  location.assign(dukeOauthUrl);
}

const authHelper = {
  tokenExists() {
    this.token = getOauthCodeFromURI();
    return this.token != null;
  },
  login() {
    ddsClient.getProviderInfo(clientName, redirectToOauth);
  },
  validateAuthentication(handleSuccess, handleFailure) {
    let oauthToken = getOauthCodeFromURI();
    const ddsAuthenticationUrl = `${DdsApiBaseURL()}authenticate`;
    const oauthCodeJson = {
      code: oauthToken,
      client: clientName,
      extra_data: {
        assumed_netid: sessionStorage.getItem("assumedNetid"),
        netid: "",
      },
    };
    callGatekeeper(
      ddsAuthenticationUrl,
      oauthCodeJson,
      handleSuccess,
      handleFailure
    );
  },
};

export default authHelper;
