import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../lib/store.js";
import { Seo } from "../../components/Seo.js";
import { OwlyLogo } from "../../components/brand/OwlyLogo.js";
import { GhostButton, PageContainer } from "../../components/design/index.js";
import { OnlineCountBadge } from "../../components/chat/OnlineCountBadge.js";
import { SafetyReminder } from "../../components/chat/SafetyReminder.js";
import { StatusIndicator } from "../../components/chat/StatusIndicator.js";
import { useOnlineCount } from "../../hooks/useOnlineCount.js";

/**
 * Session lobby: choose text or video before entering a matchmaking queue.
 * Does not mount useChat — no socket until a mode page is opened.
 */
export function SessionPage() {
  const navigate = useNavigate();
  const ageVerified = useAppStore((s) => s.ageVerified);
  const gender = useAppStore((s) => s.gender);
  const onlineCount = useOnlineCount();

  useEffect(() => {
    if (!ageVerified || !gender) {
      navigate("/age-gate");
    }
  }, [ageVerified, gender, navigate]);

  return (
    <>
      <Seo title="Session — Owly" path="/session" noindex />
      <PageContainer wide className="flex min-h-0 w-full flex-1 flex-col !py-4">
        <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex w-full min-w-0 flex-1 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <StatusIndicator state="idle" />
            </div>
            <OnlineCountBadge count={onlineCount} className="shrink-0" />
          </div>
          <SafetyReminder />
        </div>

        <div className="sx-chat-shell flex flex-1 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center space-y-6 p-8 text-center">
            <OwlyLogo size="md" alt="" />
            <div className="max-w-sm space-y-2">
              <h3 className="sx-panel-title">Ready for a conversation?</h3>
              <p className="sx-caption">
                Choose text or video, then enter the matching queue to connect with a
                random stranger.
              </p>
            </div>
            <div className="flex gap-3 flex-row">
              <GhostButton onClick={() => navigate("/session/chat")}>
                Text Chat
              </GhostButton>
              <GhostButton onClick={() => navigate("/session/video")}>
                Video Chat
              </GhostButton>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
