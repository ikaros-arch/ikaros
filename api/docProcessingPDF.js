const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');

async function convertImage(inputPath, outputPath) {
    await sharp(inputPath)
        .tiff({ compression: 'lzw' })
        .toFile(outputPath);
}

async function convertPdf(inputPath, outputDir, baseName) {
    const uint8Array = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(uint8Array);
    const numPages = pdfDoc.getPageCount();

    for (let i = 0; i < numPages; i++) {
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        
        const pdfPage = await PDFDocument.create();
        const [copiedPage] = await pdfPage.copyPages(pdfDoc, [i]);
        pdfPage.addPage(copiedPage);
        
        const pdfBytes = await pdfPage.save();
        await sharp(pdfBytes)
            .tiff({ compression: 'lzw' })
            .toFile(path.join(outputDir, `${baseName}-page-${i + 1}.tiff`));
    }
}

module.exports = { convertImage, convertPdf };
