import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GENDER_LABELS, type Gender } from "@owly/shared";
import { useChat } from "../hooks/useChat.js";
import { MessageList } from "../components/chat/MessageList.js";
import { MessageInput } from "../components/chat/MessageInput.js";
import { ChatControls } from "../components/chat/ChatControls.js";
import { VideoPanel } from "../components/chat/VideoPanel.js";
import { VideoChatLayout } from "../components/chat/VideoChatLayout.js";
import { ReactionBar } from "../components/chat/ReactionBar.js";
import { StatusIndicator } from "../components/chat/StatusIndicator.js";
import { SafetyReminder } from "../components/chat/SafetyReminder.js";
import { ReportModal } from "../components/chat/ReportModal.js";
import { WaitingScreen } from "../components/matching/WaitingScreen.js";
import { OnlineCountBadge } from "../components/chat/OnlineCountBadge.js";
import { useOnlineCount } from "../hooks/useOnlineCount.js";
import { useAppStore } from "../lib/store.js";
import { Seo } from "../components/Seo.js";
import { OwlyLogo } from "../components/brand/OwlyLogo.js";
import { GhostButton, PageContainer } from "../components/design/index.js";

function GenderChip({ gender }: { gender: Gender | null }) {
  if (!gender) return null;
  return <span className="sx-chip shrink-0">{GENDER_LABELS[gender]}</span>;
}

export function ChatPage() {
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
    localStream,
    remoteStream,
    videoStatus,
    cameraOn,
    micOn,
    partnerCameraOn,
    partnerMicOn,
    partnerMediaAvailable,
    toggleCamera,
    toggleMic,
  } = useChat();

  const onlineCount = useOnlineCount();
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    if (!ageVerified || !gender) {
      navigate("/age-gate");
    }
  }, [ageVerified, gender, navigate]);

  const isConnected = connectionState === "connected";
  const isFinding = connectionState === "finding";
  const isIdle = connectionState === "idle";
  const isError = connectionState === "error";
  const isDisconnected = connectionState === "disconnected";
  const isPartnerLeft = connectionState === "partner_left";
  const isPreSession = isIdle || isError || isFinding || isDisconnected;
  const showVideo = isConnected || isPartnerLeft;
  const chromeGender = isConnected ? partnerGender : gender;
  const isRequestingMedia = videoStatus === "requesting";
  const startChatLabel = isRequestingMedia ? "Allow camera..." : "Start Chatting";
  const tryAgainLabel = isRequestingMedia ? "Allow camera..." : "Try Again";
  const rejoinLabel = isRequestingMedia ? "Allow camera..." : "Rejoin Now";

  const reportModal = (
    <ReportModal
      open={reportModalOpen}
      onOpenChange={setReportModalOpen}
      onSubmit={reportPartner}
    />
  );

  const seo = <Seo title="Chat — Owly" path="/chat" noindex />;

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
          {isFinding ? (
            <WaitingScreen
              interests={session?.interests}
              gender={gender}
              onlineCount={onlineCount}
              onCancel={stopChat}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center space-y-6 p-8 text-center">
              <OwlyLogo size="md" alt="" />

              {isIdle ? (
                <>
                  <div className="max-w-sm space-y-2">
                    <h3 className="sx-panel-title">
                      Ready for a conversation?
                    </h3>
                    <p className="sx-caption">
                      Enter the matching queue to connect with a random stranger.
                    </p>
                  </div>
                  <GhostButton
                    disabled={isRequestingMedia}
                    onClick={() => joinQueue()}
                  >
                    {startChatLabel}
                  </GhostButton>
                </>
              ) : isError ? (
                <>
                  <div className="max-w-sm space-y-2">
                    <h3 className="sx-panel-title">Connection error</h3>
                    <p className="sx-caption">
                      {connectionError ||
                        "Could not start a chat session. Check that the API is running, then try again."}
                    </p>
                  </div>
                  <GhostButton
                    disabled={isRequestingMedia}
                    onClick={() => joinQueue()}
                  >
                    {tryAgainLabel}
                  </GhostButton>
                </>
              ) : (
                <>
                  <div className="max-w-sm space-y-2">
                    <h3 className="sx-panel-title">Disconnected</h3>
                    <p className="sx-caption">
                      Connection lost. Rejoining the queue in a moment...
                    </p>
                  </div>
                  <GhostButton
                    disabled={isRequestingMedia}
                    onClick={() => joinQueue()}
                  >
                    {rejoinLabel}
                  </GhostButton>
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
        <VideoChatLayout
          video={
            showVideo ? (
              <div className="relative h-full w-full">
                <VideoPanel
                  localStream={localStream}
                  remoteStream={remoteStream}
                  status={videoStatus}
                  cameraOn={cameraOn}
                  micOn={micOn}
                  partnerCameraOn={partnerCameraOn}
                  partnerMicOn={partnerMicOn}
                  partnerMediaAvailable={partnerMediaAvailable}
                  localGender={gender}
                  partnerGender={partnerGender}
                  onToggleCamera={toggleCamera}
                  onToggleMic={toggleMic}
                  remoteEmptyLabel={isPartnerLeft ? "Partner disconnected" : undefined}
                  reactionsEnabled={isConnected}
                  reactionBursts={reactionBursts}
                  onSendReaction={sendReaction}
                  onReactionBurstEnd={removeReactionBurst}
                />
                {isPartnerLeft ? (
                  <div className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center bg-black/50 pb-[45%] lg:pb-0">
                    <div className="mx-4 max-w-sm rounded-sm border border-white/20 bg-black/70 px-4 py-3 text-center backdrop-blur-sm">
                      <p className="text-sm font-medium uppercase tracking-wider text-white">
                        Partner disconnected
                      </p>
                      <p className="mt-1 text-xs text-white/75">
                        Click Next to find a new partner.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center bg-[var(--sx-canvas-night-soft)]">
                <p className="sx-caption px-4 text-center">
                  Video unavailable. Text chat is still active.
                </p>
              </div>
            )
          }
          chrome={
            <div>
              <div className="flex w-full items-center justify-between gap-3 px-3 pt-1 lg:px-4">
                <div className="flex min-w-0 items-center gap-2">
                  <StatusIndicator
                    state={connectionState}
                    commonInterests={commonInterests}
                    className="min-w-0 border-white/20 bg-black/50 text-white/90 backdrop-blur-sm lg:border-[var(--sx-hairline-on-dark)] lg:bg-black/40 lg:text-[var(--sx-on-primary)]"
                  />
                  <GenderChip gender={chromeGender} />
                </div>
                <OnlineCountBadge
                  count={onlineCount}
                  className="shrink-0 text-white/70 lg:text-[var(--sx-on-primary-mute)]"
                />
              </div>
              <ChatControls
                connectionState={connectionState}
                onNext={nextChat}
                onStop={stopChat}
                onOpenReport={() => setReportModalOpen(true)}
                onBlock={blockPartner}
              />
            </div>
          }
          messages={<MessageList messages={messages} partnerTyping={partnerTyping} />}
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
