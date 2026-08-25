import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { signIn, type SignInInput, type SignInResponse } from "../services/signIn.js";
import { getSessionQueryKey } from "../session-query-key.js";

type SignInMutationConfig = Partial<
  Omit<UseMutationOptions<SignInResponse, Error, SignInInput>, "mutationFn">
>;

export function useSignInMutation(config?: SignInMutationConfig) {
  const queryClient = useQueryClient();

  return useMutation({
    ...config,
    mutationKey: ["signIn"],
    mutationFn: async (input) => {
      const result = await signIn(input);
      await queryClient.invalidateQueries({
        queryKey: getSessionQueryKey(),
      });
      return result;
    },
  });
}
