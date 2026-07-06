import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

interface StarVariables {
  id: string;
  starred: boolean;
}

interface StarMutationConfig {
  star: (id: string) => Promise<void>;
  unStar: (id: string) => Promise<void>;
  messages: { added: string; removed: string };
  invalidateKeys: (id: string) => QueryKey[];
}

/**
 * Shared star/un-star toggle used by tracks, albums, and artists. Handles the
 * toggle, success toast, and cache invalidation so each domain only supplies
 * its endpoints, copy, and keys.
 */
export const useStarMutation = ({
  star,
  unStar,
  messages,
  invalidateKeys,
}: StarMutationConfig) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, starred }: StarVariables) => {
      if (starred) {
        await unStar(id);
      } else {
        await star(id);
      }
    },
    onSuccess: (_data, { id, starred }) => {
      Toast.show({
        type: "success",
        text1: starred ? messages.removed : messages.added,
      });
      for (const key of invalidateKeys(id)) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
};
