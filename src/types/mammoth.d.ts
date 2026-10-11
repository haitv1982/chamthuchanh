declare module 'mammoth' {
  export interface MammothResult {
    value: string;
    messages: any[];
  }
  export function extractRawText(options: { arrayBuffer?: ArrayBuffer; buffer?: any }): Promise<MammothResult>;
  export function convertToHtml(options: { arrayBuffer?: ArrayBuffer; buffer?: any }): Promise<MammothResult>;
}
