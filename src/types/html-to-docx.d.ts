declare module "html-to-docx" {
    const htmlToDocx: (
      html: string,
      header?: any,
      options?: any
    ) => Promise<ArrayBuffer | Uint8Array>;
    export default htmlToDocx;
  }
  