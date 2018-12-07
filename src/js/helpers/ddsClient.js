import axios from "axios";
import config from "../config/ddsconfig.js";

const ddsApiBaseURL = () => config["dds_api_base_url"];

var ddsClient = {
  send(payload, processData, handleFailure) {
    axios(payload)
      .then(processData)
      .catch((error) => {
        handleFailure(error.response.data);
      })
  }

  // getJwtToken(accessToken, handleToken, handleFailure) {
  //   console.log
  //   var url = `${ddsApiBaseURL}/user/api_token`;
  //   call(
  //     {
  //       url: url,
  //       method: 'get',
  //       params: {access_token: accessToken}
  //     },
  //     (data) => {
  //       handleToken(data.api_token, data.expires_on, data.time_to_live);
  //     },
  //     handleFailure
  //   )
  // }
  //
  // getCurrentUser(jwtToken, handleSuccess, handleFailure) {
  //   var url = `${ddsApiBaseURL}/current_user`
  //   call(
  //     {
  //       url: url,
  //       method: 'get',
  //       headers: {Authorization: jwtToken}
  //     },
  //     handleSuccess,
  //     handleFailure
  //   )
  // }
  //
  // getUserApiKey(jwtToken) {
  //   var url = `${ddsApiBaseURL}/current_user/api_key`
  //   call(
  //     {
  //       url: url,
  //       method: 'get',
  //       headers: {Authorization: jwtToken}
  //     },
  //     handleSuccess,
  //     handleFailure
  //   )
  // }
  //
  // setUserApiKey(jwtToken) {
  //   var url = `${ddsApiBaseURL}/current_user/api_key`
  //   call(
  //     {
  //       url: url,
  //       method: 'put',
  //       headers: {Authorization: jwtToken}
  //     },
  //     handleSuccess,
  //     handleFailure
  //   )
  // }
  //
  // destroyUserApiKey(jwtToken) {
  //   var url = `${ddsApiBaseURL}/current_user/api_key`
  //   call(
  //     {
  //       url: url,
  //       method: 'delete',
  //       headers: {Authorization: jwtToken}
  //     },
  //     () => {},
  //     handleFailure
  //   )
  // }
};
export default ddsClient;
