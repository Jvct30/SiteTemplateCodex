type IconProps = {
  className?: string;
};

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <rect
        x="4.5"
        y="4.5"
        width="15"
        height="15"
        rx="4.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.5" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function ShopeeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M7.2 8.4V7.1a4.8 4.8 0 0 1 9.6 0v1.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5.4 8.3h13.2l-1 11.2a2.2 2.2 0 0 1-2.2 2H8.6a2.2 2.2 0 0 1-2.2-2L5.4 8.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14.7 11.7c-.6-.4-1.5-.7-2.5-.7-1.4 0-2.3.6-2.3 1.5 0 .8.7 1.2 2.1 1.5 1.8.4 2.8 1.1 2.8 2.5 0 1.5-1.3 2.5-3.1 2.5-1.1 0-2.2-.3-3-.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WhatsappIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M5.5 19.1 6.4 16A7.4 7.4 0 1 1 9 18.4l-3.5.7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 8.8c.2-.4.3-.4.6-.4h.4c.2 0 .4.1.5.4l.6 1.3c.1.3.1.5-.1.7l-.3.4c-.1.1-.1.3 0 .5.4.7 1 1.3 1.7 1.7.2.1.4.1.5 0l.5-.4c.2-.2.4-.2.7-.1l1.3.6c.3.1.4.3.4.6v.4c0 .3 0 .4-.3.6-.4.3-1 .5-1.6.5-2.8 0-5.6-2.8-5.6-5.6 0-.6.2-1.2.5-1.6Z"
        fill="currentColor"
      />
    </svg>
  );
}
