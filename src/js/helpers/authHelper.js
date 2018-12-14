import Axios from "axios";
import ddsClient from './ddsClient'
import config from "../config/authconfig.js";

const oauthClientId = config["oauth_client_id"];
const oathRedirect = config["oauth_redirect"];
const tokenStoreKey = "api-keys-token";
const tokenExpirationStoreKey = "api-keys-token-expiration"

const authHelper = {
  isLoggedIn() {
    this.token = sessionStorage.getItem(tokenStoreKey);
    this.tokenExpiration = sessionStorage.getItem(tokenExpirationStoreKey);
    if(this.token && this.tokenExpiration) {
      if(parseInt(this.tokenExpiration) >= Date.now()) {
        return true;
      }
    }
  },

  tokenExists() {
    this.token = this.getOauthCodeFromURI();
    return this.token != null;
  },

  getOauthCodeFromURI() {
    if (window.location.href.indexOf("#access_token") > 0) {
      const parts = window.location.hash.slice(1).split("&");
      const oauthCode = parts[0].split("=")[1];
      return oauthCode;
    }
  },

  getOauthProviderInfo(successHandler, errorHandler) {
    ddsClient.getDefaultOauthProvider(
      (provider) => {
        if(provider) {
          successHandler(
            `${provider.base_uri}/${provider.login_initiation_url}?response_type=${
              provider.login_response_type
            }&client_id=${oauthClientId}&state=login&redirect_uri=${
              oathRedirect
            }`
          );
        }
        else {
          errorHandler(
            "No Default StorageProvider returned from DDS!"
          );
        }
      },
    (errorResponse) => {
      errorHandler(
        "Error getting default auth provider information " + errorResponse.message
      );
    });
  },

  login() {
    return new Promise((resolve, reject) => {
      if (this.isLoggedIn()) {
        resolve(true);
      }
      else {
        if(this.tokenExists()) {
          ddsClient.getJwtToken(
            this.token,
            (jwtToken, expiration, timeToLive) => {
              sessionStorage.setItem(tokenStoreKey, jwtToken);
              sessionStorage.setItem(tokenExpirationStoreKey, Date.now() + timeToLive)
              resolve(true);
            },
            (errorMessage) => {
              reject("Could not get JwtToken: " + errorMessage);
            }
          );
        }
        else {
          this.getOauthProviderInfo(
            (dukeOauthUrl) => {
              window.location.assign(dukeOauthUrl);
              resolve(true);
            },
            (errorMessage) => {
              reject(errorMessage);
            }
          );
        }
      }
    });
  }
};

export default authHelper;
