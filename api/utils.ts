import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

export async function getOrCreateClientId(): Promise<string> {
  let clientId = await SecureStore.getItemAsync("clientId");
  if (!clientId) {
    clientId = Crypto.randomUUID();
    await SecureStore.setItemAsync("clientId", clientId);
  }
  return clientId;
}