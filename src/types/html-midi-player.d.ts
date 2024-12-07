declare module 'html-midi-player' {
    export {};
  }
  
  declare global {
    namespace JSX {
      interface IntrinsicElements {
        'midi-player': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & { src?: string; soundFont?: boolean },
          HTMLElement
        >;
      }
    }
  }
  