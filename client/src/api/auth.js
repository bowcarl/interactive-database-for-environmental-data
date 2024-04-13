import {
  AUTH_URL,
  LOGIN_ENDPOINT,
  LOGOUT_ENDPOINT,
  REFRESH_ENDPOINT
} from '../constants/endpoints.js'
import { addFeedbackToStore } from '../utils/addFeedbackToStore.js'
import { FEEDBACK_TYPES, FEEDBACK_CODES, FEEDBACK_MESSAGES } from '../constants/feedbackMessages'

/**
 * Log in user to server
 * @param {string} username - The username to authenticate with
 * @param {string} password - The password to authenticate with 
 * @returns {Promise<boolean>} - A promise which resolves to if login was successful or not
 */
export async function authLogin(username, password) {
  try {
    // Try to login
    const response = await fetch(`${AUTH_URL}${LOGIN_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })

    // Check if the response is ok
    if (!response.ok) {
      addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.AUTH_REJECTED, FEEDBACK_MESSAGES.AUTH_REJECTED)
      return false
    }

    // Retrieve the result from the response
    const result = await response.json()

    // TODO: Update success check based on API response
    // Check if the upload was successful
    if (!result.success) {
      // If login was not successful, tell user
      addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.AUTH_REJECTED, FEEDBACK_MESSAGES.AUTH_REJECTED)
      return false
    }

    // If login was successful, tell user
    addFeedbackToStore(FEEDBACK_TYPES.SUCCESS, FEEDBACK_CODES.AUTH_SUCCESS, FEEDBACK_MESSAGES.AUTH_SUCCESS)
    return true

  } catch (error) { // Catch any possible network or fetch errors
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.AUTH_UNAVAILABLE, FEEDBACK_MESSAGES.AUTH_UNAVAILABLE)
    return false
  }
}

/**
 * Log out user from server
 * @returns {Promise<boolean>} - A promise which resolves to if logout was successful or not
 */
export async function authLogout() {
  try {
    // Try to logout
    const response = await fetch(`${AUTH_URL}${LOGOUT_ENDPOINT}`, {
      method: 'POST'
    })

    // Check if the response is ok
    if (!response.ok) {
      // If logout was unsuccessful
      addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.AUTH_UNAVAILABLE, FEEDBACK_MESSAGES.AUTH_UNAVAILABLE)
      return false
    }

    // If logout was successful, tell user
    addFeedbackToStore(FEEDBACK_TYPES.SUCCESS, FEEDBACK_CODES.AUTH_SUCCESS, FEEDBACK_MESSAGES.LOGOUT_SUCCESS)
    return true

  } catch (error) { // Catch any possible network or fetch errors
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.AUTH_UNAVAILABLE, FEEDBACK_MESSAGES.AUTH_UNAVAILABLE)
    return false
  }
}

/**
 * Refresh user token
 * @returns {Promise<boolean>} - A promise which resolves to if refresh was successful or not
 */
export async function authRefresh() {
  try {
    // Try to refresh
    const response = await fetch(`${AUTH_URL}${REFRESH_ENDPOINT}`, {
      method: 'POST'
    })

    // Check if the response is ok
    if (!response.ok) {
      // Tell user to log in 
      addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.UNAUTHORIZED, FEEDBACK_MESSAGES.UNAUTHORIZED)
      return false
    }

    // If refresh was successful tell user to refresh
    addFeedbackToStore(FEEDBACK_TYPES.SUCCESS, FEEDBACK_CODES.AUTH_SUCCESS, FEEDBACK_MESSAGES.REFRESH_SUCCESS)
    return true

  } catch (error) { // Catch any possible network or fetch errors
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.AUTH_UNAVAILABLE, FEEDBACK_MESSAGES.AUTH_UNAVAILABLE)
    return false
  }
}