import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { signOut } from "../services/signOut.js";
import { getSessionQueryKey } from "../session-query-key.js";

type SignOutMutationConfig = Partial<
  Omit<UseMutationOptions<boolean, Error, void>, "mutationFn">
>;

export function useSignOutMutation(config?: SignOutMutationConfig) {
  const queryClient = useQueryClient();

  return useMutation({
    ...config,
    mutationKey: ["signOut"],
    mutationFn: async () => {
      const ok = await signOut();
      await queryClient.invalidateQueries({
        queryKey: getSessionQueryKey(),
      });
      queryClient.removeQueries({ queryKey: getSessionQueryKey() });
      return ok;
    },
  });
}
