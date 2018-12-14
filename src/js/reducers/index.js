import { combineReducers } from 'redux'
import currentUser from './currentUserReducer'
import userApiKey from './userApiKeyReducer'

export default combineReducers({
  currentUser,
  userApiKey
})
