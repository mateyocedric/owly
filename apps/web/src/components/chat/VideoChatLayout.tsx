import React from "react";

interface VideoChatLayoutProps {
  video: React.ReactNode;
  chrome: React.ReactNode;
  messages: React.ReactNode;
  input: React.ReactNode;
  reactions?: React.ReactNode;
}

export function VideoChatLayout({
  video,
  chrome,
  messages,
  input,
  reactions,
}: VideoChatLayoutProps) {
  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col lg:flex-row">
      <div className="absolute inset-0 min-h-0 lg:relative lg:inset-auto lg:flex-1">
        {video}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <div className="pointer-events-auto">{chrome}</div>
        </div>
      </div>

      <aside className="absolute inset-x-0 bottom-0 z-10 flex max-h-[45%] min-h-0 flex-col overflow-hidden lg:relative lg:inset-auto lg:z-auto lg:h-full lg:max-h-none lg:w-[min(22rem,32%)] lg:shrink-0 lg:self-stretch lg:border-l lg:border-[var(--sx-hairline-on-dark)] lg:bg-[var(--sx-canvas-night-soft)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent lg:hidden" />

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{messages}</div>
          <div className="mt-auto shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:pb-0">
            {reactions ? (
              <div className="flex justify-center px-3 pb-1.5 lg:hidden">{reactions}</div>
            ) : null}
            {input}
          </div>
        </div>
      </aside>
    </div>
  );
}
