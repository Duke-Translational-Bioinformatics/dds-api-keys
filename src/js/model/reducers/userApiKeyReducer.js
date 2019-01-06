const userApiKey = (state = null, action) => {
  switch (action.type) {
    case 'SET_USER_API_KEY':
      return action.userApiKey
    default:
      return state
  }
}
export default userApiKey
