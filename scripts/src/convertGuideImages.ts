import {existsSync} from "fs";
import fs from "fs/promises";
import path from "path";
import {encodeGuideImage, isConvertedGuideImage} from "./guideImages";

function getInvocationDir(): string {
    // npm run switches to scripts/; INIT_CWD is the folder the command was typed in.
    return process.env.INIT_CWD ?? process.cwd();
}

async function listFiles(target: string): Promise<string[]> {
    const stats = await fs.stat(target);
    if (!stats.isDirectory()) {
        return [target];
    }

    const entries = await fs.readdir(target, {withFileTypes: true});
    return entries.filter((entry) => entry.isFile()).map((entry) => path.join(target, entry.name));
}

async function assertOutputPathIsFree(filePath: string, outputPath: string): Promise<void> {
    if (!existsSync(outputPath)) {
        return;
    }

    const [source, output] = await Promise.all([fs.stat(filePath, {bigint: true}), fs.stat(outputPath, {bigint: true})]);
    if (source.ino !== output.ino || source.dev !== output.dev) {
        throw new Error(`Not converting ${filePath}: ${outputPath} already exists and is a different image`);
    }
    if (filePath !== outputPath) {
        throw new Error(`Not converting ${filePath}: on this disk it is the same file as ${outputPath}. Rename it to ${path.basename(outputPath)} first`);
    }
}

async function convertFile(filePath: string): Promise<void> {
    const input = await fs.readFile(filePath);
    if (await isConvertedGuideImage(filePath, input)) {
        console.log(`Already converted: ${filePath}`);
        return;
    }

    const outputPath = path.join(path.dirname(filePath), `${path.parse(filePath).name}.webp`);
    await assertOutputPathIsFree(filePath, outputPath);

    const webp = await encodeGuideImage(input, filePath);
    const tempPath = `${outputPath}.${process.pid}.tmp`;
    await fs.writeFile(tempPath, webp);
    await fs.rename(tempPath, outputPath);
    if (outputPath !== filePath) {
        await fs.rm(filePath);
    }

    console.log(`Converted: ${filePath} -> ${path.basename(outputPath)} (${Math.round(webp.length / 1024)} KB)`);
}

async function main(): Promise<void> {
    const targets = process.argv.slice(2).map((target) => path.resolve(getInvocationDir(), target));
    if (targets.length === 0) {
        throw new Error("Pass the image files or folders to convert, e.g. npm --prefix scripts run convertImages -- public/skyImages/<file>");
    }

    for (const target of targets) {
        for (const filePath of await listFiles(target)) {
            await convertFile(filePath);
        }
    }
}

main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
