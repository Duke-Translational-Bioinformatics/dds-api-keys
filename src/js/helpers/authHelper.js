import Axios from "axios";
import ddsClient from './ddsClient'
import config from "../config/authconfig.js";

const oauthRedirect = config["oauth_redirect"];
const tokenStoreKey = "api-keys-token";
const tokenExpirationStoreKey = "api-keys-token-expiration"

const authHelper = {
  isLoggedIn() {
    if(this.jwt() && this.jwtExpiration()) {
      if(parseInt(this.jwtExpiration()) >= Date.now()) {
        return true;
      }
      else {
        sessionStorage.clear();
        return false;
      }
    }
  },

  jwt() {
    return sessionStorage.getItem(tokenStoreKey);
  },

  jwtExpiration() {
    return sessionStorage.getItem(tokenExpirationStoreKey);
  },

  accessTokenExists() {
    this.accessToken = this.getOauthCodeFromURI();
    return this.accessToken != null;
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
            `${provider.login_initiation_url}&state=login&redirect_uri=${
              oauthRedirect
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
        if(this.accessTokenExists()) {
          ddsClient.getJwtToken(
            this.accessToken,
            (jwtToken, expiration, timeToLive) => {
              sessionStorage.setItem(tokenStoreKey, jwtToken);
              sessionStorage.setItem(tokenExpirationStoreKey, Date.now() + timeToLive);
              window.location.replace("#");
              if (typeof window.history.replaceState == 'function') {
                history.replaceState({}, '', window.location.href.slice(0, -1));
              }
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
