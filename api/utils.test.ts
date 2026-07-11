import { getOrCreateClientId } from "@/api/utils";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

describe("getOrCreateClientId", () => {
  it("returns the stored clientId without generating a new one", async () => {
    await SecureStore.setItemAsync("clientId", "existing-id");

    const id = await getOrCreateClientId();

    expect(id).toBe("existing-id");
    expect(Crypto.randomUUID).not.toHaveBeenCalled();
  });

  it("generates and persists a clientId when none is stored", async () => {
    const id = await getOrCreateClientId();

    expect(Crypto.randomUUID).toHaveBeenCalledTimes(1);
    expect(id).toMatch(/^uuid-/);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("clientId", id);
    await expect(SecureStore.getItemAsync("clientId")).resolves.toBe(id);
  });
});
