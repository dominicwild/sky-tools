export function getImageUrl(imageFileName?: string){
    if(imageFileName){
        if (imageFileName.startsWith("http://") || imageFileName.startsWith("https://")) {
            return imageFileName
        }

        return `/skyImages/${imageFileName}`
    } else {
        return "/placeholder.svg"
    }
}
