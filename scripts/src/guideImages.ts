import path from "path";
import sharp from "sharp";
import {SKY_IMAGES_PATH} from "../../util/helper";

export const GUIDE_IMAGE_DIR = path.join(__dirname, "../../public", SKY_IMAGES_PATH);

const MAX_SIDE_PX = 2048;
const WEBP_OPTIONS = {quality: 80, effort: 6, smartSubsample: true} satisfies sharp.WebpOptions;

export async function encodeGuideImage(input: Buffer, sourceName: string): Promise<Buffer> {
    try {
        return await sharp(input, {animated: true, autoOrient: true})
            .resize({width: MAX_SIDE_PX, height: MAX_SIDE_PX, fit: "inside", withoutEnlargement: true})
            .webp(WEBP_OPTIONS)
            .toBuffer();
    } catch (error) {
        throw new Error(`Could not convert ${sourceName} to WebP`, {cause: error});
    }
}

export async function isConvertedGuideImage(filePath: string, input: Buffer): Promise<boolean> {
    if (path.extname(filePath) !== ".webp") {
        return false;
    }

    const {format, width, height} = await sharp(input).metadata();
    return format === "webp" && Math.max(width, height) <= MAX_SIDE_PX;
}
