/**
 * Scrolls to a specified element with smooth scrolling behavior, except for certain browsers where instant scrolling is applied.
 *
 * @param {string} id - The id of the target element to scroll to.
 * @param {boolean} instant - If true, the scroll action is performed instantly; otherwise, it uses smooth scrolling.
 * @returns {void} This function does not return a value.
 */
export function scrollto(id, instant){
    const element = document.getElementById(id);
    if (!element) return; // Return early if element doesn't exist
    
    if(instant && navigator.userAgent.match(/chrome|chromium|crios|edg/i)){
      element.scrollIntoView();
    } else {
      element.scrollIntoView({behavior: 'smooth'});
    }
}