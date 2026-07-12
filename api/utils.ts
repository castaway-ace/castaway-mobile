import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

/**
 * Returns this install's stable client id, generating and persisting one on
 * first use.
 *
 * @remarks
 * Sent with auth requests so the backend can identify the device across
 * sessions (e.g. to manage per-device refresh tokens). Persisted in secure
 * storage rather than derived from hardware identifiers, which are unreliable
 * and privacy-restricted on modern mobile OSes; the id survives restarts but is
 * reset by a reinstall, which is the intended "new device" semantics.
 *
 * @returns The persisted client id.
 */
export const getOrCreateClientId = async (): Promise<string> => {
  let clientId = await SecureStore.getItemAsync("clientId");
  if (!clientId) {
    clientId = Crypto.randomUUID();
    await SecureStore.setItemAsync("clientId", clientId);
  }
  return clientId;
};