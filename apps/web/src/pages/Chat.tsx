import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useChat } from "../hooks/useChat.js";
import { MessageList } from "../components/chat/MessageList.js";
import { MessageInput } from "../components/chat/MessageInput.js";
import { ChatControls } from "../components/chat/ChatControls.js";
import { VideoPanel } from "../components/chat/VideoPanel.js";
import { VideoChatLayout } from "../components/chat/VideoChatLayout.js";
import { StatusIndicator } from "../components/chat/StatusIndicator.js";
import { SafetyReminder } from "../components/chat/SafetyReminder.js";
import { ReportModal } from "../components/chat/ReportModal.js";
import { WaitingScreen } from "../components/matching/WaitingScreen.js";
import { useAppStore } from "../lib/store.js";
import { Seo } from "../components/Seo.js";
import { GhostButton, PageContainer } from "../components/design/index.js";

export function ChatPage() {
  const navigate = useNavigate();
  const ageVerified = useAppStore((s) => s.ageVerified);
  const {
    session,
    connectionState,
    commonInterests,
    messages,
    partnerTyping,
    sendCooldownSeconds,
    joinQueue,
    sendMessage,
    sendTyping,
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

  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    if (!ageVerified) {
      navigate("/age-gate");
    }
  }, [ageVerified, navigate]);

  const isConnected = connectionState === "connected";
  const isFinding = connectionState === "finding";
  const isIdle = connectionState === "idle";
  const isError = connectionState === "error";
  const isDisconnected = connectionState === "disconnected";
  const isPartnerLeft = connectionState === "partner_left";
  const isPreSession = isIdle || isError || isFinding || isDisconnected;
  const showVideo = isConnected || isPartnerLeft;

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
          <StatusIndicator state={connectionState} commonInterests={commonInterests} />
          <SafetyReminder />
        </div>

        <div className="sx-chat-shell flex flex-1 flex-col">
          {isIdle ? (
            <div className="flex flex-1 flex-col items-center justify-center space-y-6 p-8 text-center">
              <MessageSquare className="size-10 text-[var(--sx-on-primary-mute)]" />
              <div className="max-w-sm space-y-2">
                <h3 className="sx-panel-title">Ready for a conversation?</h3>
                <p className="sx-caption">
                  Enter the matching queue to connect with a random stranger.
                </p>
              </div>
              <GhostButton onClick={() => joinQueue()}>Start Chatting</GhostButton>
            </div>
          ) : isError ? (
            <div className="flex flex-1 flex-col items-center justify-center space-y-6 p-8 text-center">
              <MessageSquare className="size-10 text-[var(--sx-on-primary-mute)]" />
              <div className="max-w-sm space-y-2">
                <h3 className="sx-panel-title">Connection error</h3>
                <p className="sx-caption">
                  Could not start a chat session. Check that the API is running, then try again.
                </p>
              </div>
              <GhostButton onClick={() => joinQueue()}>Try Again</GhostButton>
            </div>
          ) : isDisconnected ? (
            <div className="flex flex-1 flex-col items-center justify-center space-y-6 p-8 text-center">
              <MessageSquare className="size-10 text-[var(--sx-on-primary-mute)]" />
              <div className="max-w-sm space-y-2">
                <h3 className="sx-panel-title">Disconnected</h3>
                <p className="sx-caption">
                  Connection lost. Rejoining the queue in a moment...
                </p>
              </div>
              <GhostButton onClick={() => joinQueue()}>Rejoin Now</GhostButton>
            </div>
          ) : (
            <WaitingScreen
              interests={session?.interests}
              onCancel={stopChat}
            />
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
                  onToggleCamera={toggleCamera}
                  onToggleMic={toggleMic}
                  remoteEmptyLabel={isPartnerLeft ? "Partner disconnected" : undefined}
                />
                {isPartnerLeft ? (
                  <div className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center bg-black/50 pb-[45%] lg:pb-0">
                    <div className="mx-4 max-w-sm rounded-sm border border-white/20 bg-black/70 px-4 py-3 text-center backdrop-blur-sm">
                      <p className="text-sm font-medium uppercase tracking-wider text-white">
                        Partner disconnected
                      </p>
                      <p className="mt-1 text-xs text-white/75">
                        Finding you a new partner in 2 seconds...
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
              <div className="px-3 pt-1 lg:px-4">
                <StatusIndicator
                  state={connectionState}
                  commonInterests={commonInterests}
                  className="border-white/20 bg-black/50 text-white/90 backdrop-blur-sm lg:border-[var(--sx-hairline-on-dark)] lg:bg-black/40 lg:text-[var(--sx-on-primary)]"
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
