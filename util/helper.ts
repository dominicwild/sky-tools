const SKY_IMAGES_CDN_URL = "https://cdn.jsdelivr.net/gh/dominicwild/sky-tools@master/skyImages";

export function getImageUrl(imageFileName?: string){
    if(imageFileName){
        if (imageFileName.startsWith("http://") || imageFileName.startsWith("https://")) {
            return imageFileName
        }

        return `${SKY_IMAGES_CDN_URL}/${imageFileName}`
    } else {
        return "/placeholder.svg"
    }
}
