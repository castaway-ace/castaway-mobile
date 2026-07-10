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
  detailKey: (id: string) => QueryKey;
  invalidateKeys: (id: string) => QueryKey[];
}

interface StarContext {
  detailKey: QueryKey;
  previous: { starred: boolean } | undefined;
}

export const useStarMutation = ({
  star,
  unStar,
  messages,
  detailKey,
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
    onMutate: async ({ id, starred }): Promise<StarContext> => {
      const key = detailKey(id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<{ starred: boolean }>(key);
      queryClient.setQueryData<{ starred: boolean }>(key, (old) =>
        old ? { ...old, starred: !starred } : old,
      );
      return { detailKey: key, previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.detailKey, context.previous);
      }
      showToast("Something went wrong. Please try again.");
    },
    onSuccess: (_data, { starred }) => {
      showToast(starred ? messages.removed : messages.added);
    },
    onSettled: (_data, _error, { id }) => {
      for (const key of invalidateKeys(id)) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
};
