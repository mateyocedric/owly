import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DEVICE_SESSION, GENDER_LABELS, type Gender } from "@owly/shared";
import { useChat } from "../../hooks/useChat.js";
import { MessageList } from "../../components/chat/MessageList.js";
import { MessageInput } from "../../components/chat/MessageInput.js";
import { ChatControls } from "../../components/chat/ChatControls.js";
import { TextChatLayout } from "../../components/chat/TextChatLayout.js";
import { ReactionBar } from "../../components/chat/ReactionBar.js";
import { StatusIndicator } from "../../components/chat/StatusIndicator.js";
import { SafetyReminder } from "../../components/chat/SafetyReminder.js";
import { ReportModal } from "../../components/chat/ReportModal.js";
import { WaitingScreen } from "../../components/matching/WaitingScreen.js";
import { OnlineCountBadge } from "../../components/chat/OnlineCountBadge.js";
import { useOnlineCount } from "../../hooks/useOnlineCount.js";
import { useAppStore } from "../../lib/store.js";
import { Seo } from "../../components/Seo.js";
import { OwlyLogo } from "../../components/brand/OwlyLogo.js";
import { GhostButton, PageContainer } from "../../components/design/index.js";

function GenderChip({ gender }: { gender: Gender | null }) {
  if (!gender) return null;
  return <span className="sx-chip shrink-0">{GENDER_LABELS[gender]}</span>;
}

export function SessionChatPage() {
  const navigate = useNavigate();
  const ageVerified = useAppStore((s) => s.ageVerified);
  const gender = useAppStore((s) => s.gender);
  const {
    session,
    connectionState,
    connectionError,
    commonInterests,
    partnerGender,
    messages,
    partnerTyping,
    sendCooldownSeconds,
    reactionBursts,
    joinQueue,
    sendMessage,
    sendTyping,
    sendReaction,
    removeReactionBurst,
    nextChat,
    stopChat,
    blockPartner,
    reportPartner,
  } = useChat({ mode: "text" });

  const onlineCount = useOnlineCount();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const wasActiveRef = useRef(false);

  useEffect(() => {
    if (!ageVerified || !gender) {
      navigate("/age-gate");
    }
  }, [ageVerified, gender, navigate]);

  // Auto-join once on mount (lobby already chose text).
  useEffect(() => {
    void joinQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- join once on enter
  }, []);

  useEffect(() => {
    if (connectionState !== "idle") {
      wasActiveRef.current = true;
      return;
    }
    if (wasActiveRef.current) {
      navigate("/session", { replace: true });
    }
  }, [connectionState, navigate]);

  const isConnected = connectionState === "connected";
  const isFinding = connectionState === "finding";
  const isIdle = connectionState === "idle";
  const isError = connectionState === "error";
  const isDisconnected = connectionState === "disconnected";
  const isPartnerLeft = connectionState === "partner_left";
  const isPreSession = isIdle || isError || isFinding || isDisconnected;
  const chromeGender = isConnected ? partnerGender : gender;

  const reportModal = (
    <ReportModal
      open={reportModalOpen}
      onOpenChange={setReportModalOpen}
      onSubmit={reportPartner}
    />
  );

  const seo = <Seo title="Text Chat — Owly" path="/session/chat" noindex />;

  if (isPreSession) {
    return (
      <>
        {seo}
        <PageContainer wide className="flex min-h-0 w-full flex-1 flex-col !py-4">
          <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex w-full min-w-0 flex-1 items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <StatusIndicator state={connectionState} commonInterests={commonInterests} />
              </div>
              <OnlineCountBadge count={onlineCount} className="shrink-0" />
            </div>
            <SafetyReminder />
          </div>

          <div className="sx-chat-shell flex flex-1 flex-col">
            {isFinding || isIdle ? (
              <WaitingScreen
                interests={session?.interests}
                gender={gender}
                onlineCount={onlineCount}
                onCancel={() => {
                  stopChat();
                  navigate("/session", { replace: true });
                }}
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center space-y-6 p-8 text-center">
                <OwlyLogo size="md" alt="" />

                {isError ? (
                  <>
                    <div className="max-w-sm space-y-2">
                      <h3 className="sx-panel-title">
                        {connectionError === DEVICE_SESSION.ACTIVE_MESSAGE
                          ? "Session already active"
                          : "Connection error"}
                      </h3>
                      <p className="sx-caption">
                        {connectionError ||
                          "Could not start a text session. Check that the API is running, then try again."}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <GhostButton onClick={() => joinQueue()}>Try Again</GhostButton>
                      <GhostButton onClick={() => navigate("/session")}>Back</GhostButton>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="max-w-sm space-y-2">
                      <h3 className="sx-panel-title">Disconnected</h3>
                      <p className="sx-caption">
                        Connection lost. Rejoining the queue in a moment...
                      </p>
                    </div>
                    <GhostButton onClick={() => joinQueue()}>Rejoin Now</GhostButton>
                  </>
                )}
              </div>
            )}
          </div>

          {reportModal}
        </PageContainer>
      </>
    );
  }

  return (
    <>
      {seo}
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <TextChatLayout
          chrome={
            <div>
              <div className="flex w-full items-center justify-between gap-3 px-3 pt-1 lg:px-4">
                <div className="flex min-w-0 items-center gap-2">
                  <StatusIndicator
                    state={connectionState}
                    commonInterests={commonInterests}
                    className="min-w-0"
                  />
                  <GenderChip gender={chromeGender} />
                </div>
                <OnlineCountBadge count={onlineCount} className="shrink-0" />
              </div>
              <ChatControls
                connectionState={connectionState}
                onNext={nextChat}
                onStop={() => {
                  stopChat();
                  navigate("/session", { replace: true });
                }}
                onOpenReport={() => setReportModalOpen(true)}
                onBlock={blockPartner}
              />
              {isPartnerLeft ? (
                <p className="px-3 pb-2 text-center sx-caption lg:px-4">
                  Partner disconnected. Click Next to find a new partner.
                </p>
              ) : null}
            </div>
          }
          messages={<MessageList messages={messages} partnerTyping={partnerTyping} />}
          reactionBursts={reactionBursts}
          onReactionBurstEnd={removeReactionBurst}
          reactions={
            <ReactionBar disabled={!isConnected} onReact={sendReaction} />
          }
          input={
            <MessageInput
              onSend={sendMessage}
              onTyping={sendTyping}
              disabled={!isConnected}
              cooldownSeconds={sendCooldownSeconds}
            />
          }
        />
      </div>

      {reportModal}
    </>
  );
}
