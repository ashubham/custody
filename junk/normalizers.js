function normalizeChartResponse(obj) {
    if (obj.text) {
        let s = obj.text;
        // Remove fun fact prefix.
        s = `<PREFIX> ${s.slice(s.indexOf("*<"))}`;
        s = removeBaseUrl(s);
        // Remove fun fact.
        s = `${s.slice(0, s.indexOf(">*"))} <FUN FACT>`;
        obj.text = s
    }
    if (obj.attachments) {
        obj.attachments = obj.attachments.map((attachment) => {
            if (attachment.fallback) {
                attachment.fallback = removeBaseUrl(attachment.fallback);
            }
            if (attachment.pretext) {
                attachment.pretext = removeBaseUrl(attachment.pretext);
            }
            return attachment;
        });
    }
}

function normalizeUploadToSlack(obj) {
    if (obj.text) {
        let uploadIndex = obj.text.indexOf("uploaded");
        let urlStart = obj.text.indexOf("<https");
        let endUrl = obj.text.indexOf("> and");
        obj.text = `<BOT> ${obj.text.slice(uploadIndex, urlStart)}` +
            `<URL> ${obj.text.slice(endUrl + 1)}`;
    }
}

function normalizeSubscriptionDetail(obj) {
    if (obj.attachments && obj.attachments[0].fields) {
        let fields = obj.attachments[0].fields;
        fields.forEach((field) => {
            if (field.value === '_User_') {
                field.title = field.title.replace(new RegExp(" .*$"), " USER");
            }
        });
    }
}

function removeBaseUrl(s) {
    return `${s.slice(0, s.indexOf("*<"))} <BASE_URL>${s.slice(s.indexOf("/#"))}`;
}

module.exports = {
    normalizeChartResponse,
    normalizeSubscriptionDetail,
    normalizeUploadToSlack
}