import path from "path";
import sharp from "sharp";

export const GUIDE_IMAGE_DIR = path.join(__dirname, "../../skyImages");

const MAX_SIDE_PX = 2048;
const WEBP_OPTIONS = {quality: 80, effort: 6, smartSubsample: true} satisfies sharp.WebpOptions;

export async function encodeGuideImage(input: Buffer, sourceName: string): Promise<Buffer> {
    const webp = await sharp(input, {animated: true, autoOrient: true})
        .resize({width: MAX_SIDE_PX, height: MAX_SIDE_PX, fit: "inside", withoutEnlargement: true})
        .webp(WEBP_OPTIONS)
        .toBuffer()
        .catch((error: unknown) => {
            throw new Error(`Could not convert ${sourceName} to WebP`, {cause: error});
        });

    const [inputFrames, outputFrames] = await Promise.all([countFrames(input), countFrames(webp)]);
    if (inputFrames !== outputFrames) {
        throw new Error(`Could not convert ${sourceName} to WebP: it has ${inputFrames} frames but the WebP has ${outputFrames}`);
    }

    return webp;
}

async function countFrames(image: Buffer): Promise<number> {
    const {format, pages} = await sharp(image).metadata();
    return format === "png" ? countPngFrames(image) : pages ?? 1;
}

// sharp reads only the first frame of an animated PNG; the frame count lives in the acTL chunk before the image data.
function countPngFrames(png: Buffer): number {
    let offset = 8;
    while (offset + 8 <= png.length) {
        const chunkType = png.toString("latin1", offset + 4, offset + 8);
        if (chunkType === "acTL") {
            return png.readUInt32BE(offset + 8);
        }
        if (chunkType === "IDAT") {
            return 1;
        }
        offset += 12 + png.readUInt32BE(offset);
    }
    return 1;
}

export async function isConvertedGuideImage(filePath: string, input: Buffer): Promise<boolean> {
    if (path.extname(filePath) !== ".webp") {
        return false;
    }

    const {format, width, height} = await sharp(input).metadata();
    return format === "webp" && Math.max(width, height) <= MAX_SIDE_PX;
}
