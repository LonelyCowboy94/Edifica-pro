export const Flags = {
  sr: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 36 26" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="36" height="26" fill="white" />
      <path d="M0 0H36V8.66667H0V0Z" fill="#C6363C" />
      <path d="M0 8.66663H36V17.3333H0V8.66663Z" fill="#2E3B70" />
      <path d="M0 17.3333H36V26H0V17.3333Z" fill="white" />
    </svg>
  ),
  de: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 36 26" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M0 0H36V8.66667H0V0Z" fill="black" />
      <path d="M0 8.66663H36V17.3333H0V8.66663Z" fill="#D02F44" />
      <path d="M0 17.3333H36V26H0V17.3333Z" fill="#FFAD1C" />
    </svg>
  ),
  en: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 36 26" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M0 0H36V26H0V0Z" fill="#012169" />
      <path d="M15.5 0V10.5H0V15.5H15.5V26H20.5V15.5H36V10.5H20.5V0H15.5Z" fill="white" />
      <path d="M17 0V11.5H0V14.5H17V26H19V14.5H36V11.5H19V0H17Z" fill="#C8102E" />
    </svg>
  ),
};