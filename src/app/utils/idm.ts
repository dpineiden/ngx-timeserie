/*
Create an unique identificator stored on a list
 */

export function makeid(n: number) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < n; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


export function idm_in_list(n: number, list) {
    var idm = makeid(n)
    while (list.find(d => { return d == idm })) {
        idm = makeid(n)
    }
    list.push(idm)
    return idm
}
