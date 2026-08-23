import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../hooks/useChat.js";
import { MessageList } from "../components/chat/MessageList.js";
import { MessageInput } from "../components/chat/MessageInput.js";
import { ChatControls } from "../components/chat/ChatControls.js";
import { VideoPanel } from "../components/chat/VideoPanel.js";
import { StatusIndicator } from "../components/chat/StatusIndicator.js";
import { SafetyReminder } from "../components/chat/SafetyReminder.js";
import { ReportModal } from "../components/chat/ReportModal.js";
import { WaitingScreen } from "../components/matching/WaitingScreen.js";
import { Button } from "@owly/ui";
import { MessageSquare, Sparkles } from "lucide-react";
import { useAppStore } from "../lib/store.js";

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

  // If age not verified, redirect to age gate
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
    <div className="mx-auto max-w-4xl px-2 sm:px-4 py-4 flex flex-col h-[calc(100vh-4.5rem)]">
      {/* Top Bar: Status & Safety */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <StatusIndicator
          state={connectionState}
          commonInterests={commonInterests}
        />
        <SafetyReminder />
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/90 backdrop-blur-md overflow-hidden shadow-2xl">
        {isIdle ? (
          /* Idle Start Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="h-16 w-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-bold text-white">Ready for a conversation?</h3>
              <p className="text-xs text-zinc-400">
                Click below to enter the matching queue and connect with a random stranger.
              </p>
            </div>

            <Button
              onClick={() => joinQueue()}
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold shadow-xl shadow-violet-600/30 px-8 h-13 rounded-xl"
            >
              <Sparkles className="h-5 w-5 mr-2 text-amber-300" />
              Start Chatting
            </Button>
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="h-16 w-16 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-bold text-white">Connection error</h3>
              <p className="text-xs text-zinc-400">
                Could not start a chat session. Check that the API is running, then try again.
              </p>
            </div>
            <Button
              onClick={() => joinQueue()}
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold shadow-xl shadow-violet-600/30 px-8 h-13 rounded-xl"
            >
              Try again
            </Button>
          </div>
        ) : isFinding ? (
          /* Matchmaking Waiting Screen */
          <WaitingScreen
            position={queuePosition}
            interests={session?.interests}
            onCancel={stopChat}
          />
        ) : (
          /* Active Chat Stream */
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

            <MessageList
              messages={messages}
              partnerTyping={partnerTyping}
            />

            <MessageInput
              onSend={sendMessage}
              onTyping={sendTyping}
              disabled={!isConnected}
              cooldownSeconds={sendCooldownSeconds}
            />
          </>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        onSubmit={reportPartner}
      />
    </div>
  );
}
