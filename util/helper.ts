export const SKY_IMAGES_PATH = "/skyImages";

export function getImageUrl(imageFileName?: string){
    if(imageFileName){
        if (imageFileName.startsWith("http://") || imageFileName.startsWith("https://")) {
            return imageFileName
        }

        return `${SKY_IMAGES_PATH}/${imageFileName}`
    } else {
        return "/placeholder.svg"
    }
}
