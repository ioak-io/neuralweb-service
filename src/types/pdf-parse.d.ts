declare module 'pdf-parse' {
    interface PDFParseOptions {
        version?: string;
    }

    interface PDFInfo {
        [key: string]: any;
    }

    interface PDFMetadata {
        [key: string]: any;
    }

    interface PDFText {
        text: string;
        numpages: number;
        numrender: number;
        info: PDFInfo;
        metadata?: PDFMetadata;
        version: string;
    }

    function pdf(dataBuffer: Buffer | Uint8Array, options?: PDFParseOptions): Promise<PDFText>;

    export = pdf;
}
