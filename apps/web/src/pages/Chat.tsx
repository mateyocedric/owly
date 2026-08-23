import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useChat } from "../hooks/useChat.js";
import { MessageList } from "../components/chat/MessageList.js";
import { MessageInput } from "../components/chat/MessageInput.js";
import { ChatControls } from "../components/chat/ChatControls.js";
import { VideoPanel } from "../components/chat/VideoPanel.js";
import { StatusIndicator } from "../components/chat/StatusIndicator.js";
import { SafetyReminder } from "../components/chat/SafetyReminder.js";
import { ReportModal } from "../components/chat/ReportModal.js";
import { WaitingScreen } from "../components/matching/WaitingScreen.js";
import { useAppStore } from "../lib/store.js";
import { GhostButton, PageContainer } from "../components/design/index.js";

export function ChatPage() {
  const navigate = useNavigate();
  const ageVerified = useAppStore((s) => s.ageVerified);
  const {
    session,
    connectionState,
    commonInterests,
    queuePosition,
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

  return (
    <PageContainer wide className="flex h-[calc(100vh-8rem)] flex-col py-4">
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
        ) : isFinding ? (
          <WaitingScreen
            position={queuePosition}
            interests={session?.interests}
            onCancel={stopChat}
          />
        ) : (
          <>
            <ChatControls
              connectionState={connectionState}
              onNext={nextChat}
              onStop={stopChat}
              onOpenReport={() => setReportModalOpen(true)}
              onBlock={blockPartner}
            />

            {(isConnected || connectionState === "partner_left") && (
              <VideoPanel
                localStream={localStream}
                remoteStream={remoteStream}
                status={videoStatus}
                cameraOn={cameraOn}
                micOn={micOn}
                partnerCameraOn={partnerCameraOn}
                partnerMicOn={partnerMicOn}
                onToggleCamera={toggleCamera}
                onToggleMic={toggleMic}
              />
            )}

            <MessageList messages={messages} partnerTyping={partnerTyping} />

            <MessageInput
              onSend={sendMessage}
              onTyping={sendTyping}
              disabled={!isConnected}
              cooldownSeconds={sendCooldownSeconds}
            />
          </>
        )}
      </div>

      <ReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        onSubmit={reportPartner}
      />
    </PageContainer>
  );
}
