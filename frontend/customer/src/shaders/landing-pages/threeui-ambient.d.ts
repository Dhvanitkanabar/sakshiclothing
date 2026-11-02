declare module "../tidecrest-hero/tidecrestDocument.js" {
  export function buildTidecrestDocument(...args: any[]): any;
}

declare module "../meridian-landing-page/meridianDocument.js" {
  export function buildMeridianDocument(...args: any[]): any;
}

declare module "../ascii-field/asciiFieldDocuments.js" {
  export function buildAsciiFieldDocument(...args: any[]): any;
}

declare module "../betawise-globe/betawiseGlobeDocument.js" {
  export function buildBetawiseGlobeDocument(...args: any[]): any;
}

declare module "../nocturne-hero/NocturneScene" {
  export const NOCTURNE_TITLES: any;
  export const NOCTURNE_VARIANTS: any;
  export function buildNocturneDocument(...args: any[]): any;
  export type NocturneVariant = any;
}

declare module "./sandboxedPageDocument" {
  export function buildSandboxedPageDocument(...args: any[]): any;
}

declare module "../sylva-living-world/SylvaLivingWorldScene" {
  export const MAPLE_AUTUMN_STYLE: any;
  export const SAKURA_SUNSET_STYLE: any;
  export const SEQUOIA_MIST_STYLE: any;
  export function applyMapleAutumnVariant(...args: any[]): any;
  export function applySakuraSunsetVariant(...args: any[]): any;
  export function applySequoiaMistVariant(...args: any[]): any;
}
