import { Store } from 'tauri-plugin-store-api'

/**
 * Sets the login token in local app data once a user has logged in.
 * @param store initialized in the App.tsx
 * @param token used for API requests
 */
export async function setLocalToken(store: Store, token: String | undefined): Promise<void> {
    await store.set('token', { value: token})
  }

  /**
   * Gets the login token from local app data if it exists.
   * @param store initialized in the App.tsx
   * @returns a token string or undefined if nobody is logged in.
   */
export async function getLocalToken(store: Store): Promise<string | undefined> {
    let token: string = await store.get('token')
    return token
}