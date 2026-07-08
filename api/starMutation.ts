import { useToast } from "@/contexts/toastContext";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";

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

export const useStarMutation = ({
  star,
  unStar,
  messages,
  invalidateKeys,
}: StarMutationConfig) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async ({ id, starred }: StarVariables) => {
      if (starred) {
        await unStar(id);
      } else {
        await star(id);
      }
    },
    onSuccess: (_data, { id, starred }) => {
      showToast(starred ? messages.removed : messages.added);
      for (const key of invalidateKeys(id)) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
};
