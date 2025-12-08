import React from 'react';

// ============================================
// NAVIGATION & UI ICONS
// ============================================

export const MenuIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

export const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const HomeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const GlobeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const HeartIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const HeartFilledIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
  </svg>
);

export const HeartHandshakeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

export const MessageIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
  </svg>
);

export const MessageCircleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

export const SettingsIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const LogOutIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

// ============================================
// NOTIFICATION ICONS
// ============================================

export const BellOnIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.07046 10.26C7.96453 7.86801 9.19303 7.03601 11.2132 7.03601C13.2334 7.03601 14.4619 7.86801 15.356 10.26C15.3728 10.3055 15.3862 10.3524 15.396 10.4L16.5543 15.917C16.6155 16.2008 16.5485 16.4978 16.3719 16.7251C16.1953 16.9525 15.928 17.0858 15.6446 17.088H13.3173C13.37 17.6989 13.1737 18.3048 12.7751 18.7618C12.3764 19.2188 11.811 19.4861 11.2132 19.5C10.6151 19.4861 10.0494 19.2186 9.65063 18.7611C9.25191 18.3037 9.05587 17.6972 9.10918 17.086H6.78186C6.49847 17.0838 6.2312 16.9505 6.0546 16.7231C5.878 16.4958 5.81096 16.1988 5.87218 15.915L7.03048 10.4C7.04027 10.3524 7.05363 10.3055 7.07046 10.26Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M9.10921 16.336C8.69499 16.336 8.35921 16.6718 8.35921 17.086C8.35921 17.5002 8.69499 17.836 9.10921 17.836V16.336ZM13.3173 17.836C13.7315 17.836 14.0673 17.5002 14.0673 17.086C14.0673 16.6718 13.7315 16.336 13.3173 16.336V17.836ZM9.62888 4.75C9.21467 4.75 8.87888 5.08579 8.87888 5.5C8.87888 5.91421 9.21467 6.25 9.62888 6.25V4.75ZM12.7976 6.25C13.2118 6.25 13.5476 5.91421 13.5476 5.5C13.5476 5.08579 13.2118 4.75 12.7976 4.75V6.25ZM9.10921 17.836H13.3173V16.336H9.10921V17.836ZM9.62888 6.25H12.7976V4.75H9.62888V6.25Z"
      fill="currentColor"
    />
  </svg>
);

export const BellOffIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10.1322 4.75C9.71799 4.75 9.3822 5.08579 9.3822 5.5C9.3822 5.91421 9.71799 6.25 10.1322 6.25V4.75ZM13.4053 6.25C13.8195 6.25 14.1553 5.91421 14.1553 5.5C14.1553 5.08579 13.8195 4.75 13.4053 4.75V6.25ZM13.6978 16.629C13.2836 16.629 12.9478 16.9648 12.9478 17.379C12.9478 17.7932 13.2836 18.129 13.6978 18.129V16.629ZM16.0222 17.379L16.0222 18.1291L16.032 18.1289L16.0222 17.379ZM17.392 16.56L18.044 16.9308C18.0597 16.9032 18.0736 16.8746 18.0857 16.8452L17.392 16.56ZM17.1678 14.667L16.4516 14.8895C16.4759 14.9679 16.513 15.0417 16.5612 15.1081L17.1678 14.667ZM16.5828 11.695L17.3299 11.6293C17.3281 11.6086 17.3254 11.5881 17.3219 11.5677L16.5828 11.695ZM15.7736 8.37843C15.4955 8.07147 15.0212 8.04808 14.7142 8.3262C14.4073 8.60431 14.3839 9.07861 14.662 9.38557L15.7736 8.37843ZM13.689 18.132C14.1032 18.132 14.439 17.7962 14.439 17.382C14.439 16.9678 14.1032 16.632 13.689 16.632V18.132ZM9.83775 16.632C9.42354 16.632 9.08775 16.9678 9.08775 17.382C9.08775 17.7962 9.42354 18.132 9.83775 18.132V16.632ZM14.4488 17.382C14.4488 16.9678 14.113 16.632 13.6988 16.632C13.2845 16.632 12.9488 16.9678 12.9488 17.382H14.4488ZM10.5877 17.382C10.5877 16.9678 10.252 16.632 9.83775 16.632C9.42354 16.632 9.08775 16.9678 9.08775 17.382L10.5877 17.382ZM9.83775 18.132C10.252 18.132 10.5878 17.7962 10.5878 17.382C10.5878 16.9678 10.252 16.632 9.83775 16.632V18.132ZM7.51335 17.382L7.51168 18.132H7.51335V17.382ZM7.27215 16.5906C6.88091 16.4546 6.45347 16.6615 6.31745 17.0527C6.18142 17.4439 6.38831 17.8714 6.77955 18.0074L7.27215 16.5906ZM19.062 6.02358C19.3512 5.727 19.3452 5.25216 19.0486 4.963C18.752 4.67384 18.2772 4.67985 17.988 4.97642L19.062 6.02358ZM14.6905 8.35842C14.4014 8.655 14.4074 9.12984 14.704 9.419C15.0006 9.70816 15.4754 9.70215 15.7645 9.40558L14.6905 8.35842ZM4.338 18.9764C4.04884 19.273 4.05485 19.7478 4.35142 20.037C4.648 20.3262 5.12284 20.3202 5.412 20.0236L4.338 18.9764ZM7.557 17.8236C7.84616 17.527 7.84015 17.0522 7.54358 16.763C7.247 16.4738 6.77216 16.4798 6.483 16.7764L7.557 17.8236ZM15.7616 9.40858C16.0508 9.112 16.0448 8.63716 15.7482 8.348C15.4516 8.05884 14.9768 8.06485 14.6876 8.36142L15.7616 9.40858ZM6.483 16.7764C6.19384 17.073 6.19985 17.5478 6.49642 17.837C6.793 18.1262 7.26784 18.1202 7.557 17.8236L6.483 16.7764ZM13.2634 8.36888C13.6433 8.53394 14.0851 8.35977 14.2501 7.97987C14.4152 7.59996 14.241 7.15818 13.8611 6.99312L13.2634 8.36888ZM11.7682 7.308L11.7677 6.558C11.7604 6.55801 11.753 6.55812 11.7457 6.55834L11.7682 7.308ZM6.94785 11.7L6.20559 11.5925C6.20358 11.6064 6.20196 11.6203 6.20074 11.6343L6.94785 11.7ZM6.36285 14.672L7.01763 15.0377C7.04304 14.9923 7.06364 14.9442 7.07909 14.8945L6.36285 14.672ZM5.33462 15.1879C5.21525 15.5845 5.44002 16.0028 5.83666 16.1222C6.23329 16.2416 6.65161 16.0168 6.77098 15.6201L5.33462 15.1879ZM10.1322 6.25H13.4053V4.75H10.1322V6.25ZM13.6978 18.129H16.0222V16.629H13.6978V18.129ZM16.032 18.1289C16.8696 18.1179 17.6307 17.6574 18.044 16.9308L16.7401 16.1892C16.5838 16.4641 16.3051 16.6252 16.0123 16.6291L16.032 18.1289ZM18.0857 16.8452C18.4419 15.9788 18.3252 14.9833 17.7744 14.2259L16.5612 15.1081C16.8039 15.4418 16.8579 15.8869 16.6984 16.2748L18.0857 16.8452ZM17.884 14.4445C17.5999 13.5298 17.4141 12.5857 17.3299 11.6293L15.8357 11.7607C15.9292 12.8234 16.1357 13.8725 16.4516 14.8895L17.884 14.4445ZM17.3219 11.5677C17.1167 10.3761 16.5799 9.26839 15.7736 8.37843L14.662 9.38557C15.275 10.0621 15.6862 10.908 15.8437 11.8223L17.3219 11.5677ZM13.689 16.632H9.83775V18.132H13.689V16.632ZM12.9488 17.382C12.9488 17.8306 12.7153 18.2359 12.3514 18.4514L13.1156 19.7421C13.9463 19.2502 14.4488 18.3482 14.4488 17.382H12.9488ZM12.3514 18.4514C11.9897 18.6655 11.5468 18.6655 11.1851 18.4514L10.4209 19.7421C11.2538 20.2353 12.2827 20.2353 13.1156 19.7421L12.3514 18.4514ZM11.1851 18.4514C10.8212 18.2359 10.5877 17.8306 10.5877 17.382L9.08775 17.382C9.08775 18.3482 9.59024 19.2502 10.4209 19.7421L11.1851 18.4514ZM9.83775 16.632H7.51335V18.132H9.83775V16.632ZM7.51502 16.632C7.43272 16.6318 7.35073 16.6179 7.27215 16.5906L6.77955 18.0074C7.01504 18.0893 7.26235 18.1314 7.51168 18.132L7.51502 16.632ZM17.988 4.97642L14.6905 8.35842L15.7645 9.40558L19.062 6.02358L17.988 4.97642ZM5.412 20.0236L7.557 17.8236L6.483 16.7764L4.338 18.9764L5.412 20.0236ZM14.6876 8.36142L6.483 16.7764L7.557 17.8236L15.7616 9.40858L14.6876 8.36142ZM13.8611 6.99312C13.1995 6.70566 12.4875 6.5575 11.7677 6.558L11.7688 8.058C12.2817 8.05764 12.7899 8.16318 13.2634 8.36888L13.8611 6.99312ZM11.7457 6.55834C8.9363 6.6429 6.61328 8.77736 6.20559 11.5925L7.69011 11.8075C7.99732 9.68609 9.73636 8.1195 11.7908 8.05766L11.7457 6.55834ZM6.20074 11.6343C6.11658 12.5907 5.93074 13.5348 5.64661 14.4495L7.07909 14.8945C7.39498 13.8775 7.60147 12.8284 7.69496 11.7657L6.20074 11.6343ZM5.70807 14.3063C5.55215 14.5854 5.42695 14.8811 5.33462 15.1879L6.77098 15.6201C6.83212 15.417 6.91489 15.2217 7.01763 15.0377L5.70807 14.3063Z"
      fill="currentColor"
    />
  </svg>
);

// ============================================
// LOCATION & MAP ICONS
// ============================================

export const MapPinIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const MapIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" x2="9" y1="3" y2="18" />
    <line x1="15" x2="15" y1="6" y2="21" />
  </svg>
);

// ============================================
// SPECIAL ICONS
// ============================================

export const SparklesIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

export const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

export const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 5 7 7-7 7" />
    <path d="M5 12h14" />
  </svg>
);

// ============================================
// AUTHENTICATION ICONS
// ============================================

export const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// ============================================
// UPLOAD & FILE ICONS
// ============================================

export const UploadIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
    />
  </svg>
);

export const CameraIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
    />
  </svg>
);

export const UserIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
);

export const UsersIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const FilterIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
