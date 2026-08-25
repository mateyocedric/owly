import React, { useState } from "react";
import { Button, Input } from "@owly/ui";
import { useSignInMutation } from "../../../../client/hooks/useSignInMutation.js";
import { Seo } from "../../../../components/Seo.js";
import {
  DarkSurface,
  PageContainer,
  PagePanel,
  PanelHeader,
} from "../../../../components/design/index.js";

export function AdminSignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const signInMutation = useSignInMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      await signInMutation.mutateAsync({ username, password });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid login credentials";
      setAuthError(message);
    }
  };

  return (
    <PageContainer narrow>
      <Seo title="Staff Portal — Owly" path="/admin" noindex />
      <PagePanel>
        <PanelHeader title="Staff Login" description="Authorized personnel only" />
        <DarkSurface>
          {authError ? (
            <p className="text-sm text-destructive">{authError}</p>
          ) : null}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="sx-caption mb-0 block text-xs uppercase tracking-wider">
                Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="sx-caption mb-0 block text-xs uppercase tracking-wider">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={signInMutation.isPending}>
              {signInMutation.isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </DarkSurface>
      </PagePanel>
    </PageContainer>
  );
}
