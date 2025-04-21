export function getImageUrl(imageFileName?: string){
    if(imageFileName){
        return `/skyImages/${imageFileName}`
    } else {
        return "/placeholder.svg"
    }
}