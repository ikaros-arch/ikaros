const { exec } = require('child_process');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

async function convertImageToJP2(inputPath, outputPath) {
    const tempTiffPath = path.join(__dirname, 'temp.tif'); // Temporary TIFF file

    // Convert image to TIFF first
    await sharp(inputPath)
        .tiff({ compression: 'lzw' })
        .toFile(tempTiffPath);
    
    // Convert TIFF to JPEG-2000 with tiling
    const command = `opj_compress -i ${tempTiffPath} -o ${outputPath} -t 256,256 -n 6,1 -r 5,4,3,2,1,0.5 -c [384,384],[-1,-1]`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
        console.log(`Output: ${stdout}`);

        // Delete temporary TIFF file
        fs.unlinkSync(tempTiffPath);
    });
}

module.exports = { convertImageToJP2 };
