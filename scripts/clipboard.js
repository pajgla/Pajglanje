
export function copyToClipboard(stringWithNewLines){
    const mySmartTextarea = document.createElement('textarea');
    mySmartTextarea.innerHTML = stringWithNewLines;
    document.body.appendChild(mySmartTextarea);
    mySmartTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(mySmartTextarea);
}