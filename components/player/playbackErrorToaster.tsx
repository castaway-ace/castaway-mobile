import { useAudioPlayerContext } from "@/contexts/audioPlayerContext";
import { useToast } from "@/contexts/toastContext";
import { useEffect, useRef } from "react";

// Deliberately generic: the engine's raw error is often an opaque native string
// ("AVFoundationErrorDomain -11800") the user can't act on, whereas retrying or
// checking their connection is something they can.
const PLAYBACK_ERROR_MESSAGE = "Couldn't play that track. Please try again.";

/**
 * Renderless bridge that turns a playback failure into a toast.
 *
 * @remarks
 * {@link AudioPlayerProvider} only *records* the error — it sits above
 * {@link ToastProvider} in the tree, so it can't raise a toast itself. This
 * component lives inside the toast provider and forwards each new failure along.
 * Without it, a failed stream (a dead session, a dropped connection) is silent:
 * the queue stalls and the user is left staring at a track that never starts.
 *
 * The ref holds the last error already shown so a single failure toasts once,
 * even though the error stays set on the context until the next successful load;
 * a genuinely new failure is a new `Error` instance, so it toasts again.
 */
const PlaybackErrorToaster = (): null => {
  const { error } = useAudioPlayerContext();
  const { showToast } = useToast();
  const lastShownRef = useRef<Error | null>(null);

  useEffect(() => {
    if (error && error !== lastShownRef.current) {
      lastShownRef.current = error;
      showToast(PLAYBACK_ERROR_MESSAGE);
    }
  }, [error, showToast]);

  return null;
};

export default PlaybackErrorToaster;
