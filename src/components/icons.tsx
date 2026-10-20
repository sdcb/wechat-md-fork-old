export function BrandMark() {
  return (
    <svg className="brandMark" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#512bd4" />
          <stop offset="1" stopColor="#0078d4" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#brandGradient)" />
      <path
        fill="#fff"
        transform="translate(1.4 7.7) scale(0.13)"
        d="M30 98V30h20l20 25 20-25h20v68H90V59L70 84 50 59v39zm125 0-30-33h20V30h20v35h20z"
      />
    </svg>
  );
}

export function CopyIcon() {
  return (
    <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 2a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h7a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8Zm0 1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM4 6a2 2 0 0 1 1-1.73V14.5A2.5 2.5 0 0 0 7.5 17h6.23A2 2 0 0 1 12 18H7.5A3.5 3.5 0 0 1 4 14.5V6Z"
      />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.65 14.39 3.7 10.43a.75.75 0 1 1 1.06-1.06l3.42 3.42 7.06-7.07a.75.75 0 1 1 1.06 1.06l-7.6 7.6a.75.75 0 0 1-1.05 0Z"
      />
    </svg>
  );
}

export function ImageIcon() {
  return (
    <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM3 6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm3-2a2 2 0 0 0-2 2v8c0 .37.1.72.28 1.02l4.67-4.6a1.5 1.5 0 0 1 2.1 0l4.67 4.6c.18-.3.28-.65.28-1.02V6a2 2 0 0 0-2-2H6Zm0 12h8c.36 0 .7-.1 1-.27l-4.65-4.6a.5.5 0 0 0-.7 0L5 15.73c.3.17.64.27 1 .27Z"
      />
    </svg>
  );
}
