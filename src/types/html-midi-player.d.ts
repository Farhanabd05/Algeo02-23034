// src/types/html-midi-player.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'midi-player': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      src?: string;
      soundFont?: boolean;
    };
  }
}