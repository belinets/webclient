/**
 * Simple Emoticon filter that converts plain-text emoticons to <DIV> with css class names based on the emoticon
 *
 * @param megaChat
 * @returns {EmoticonsFilter}
 * @constructor
 */
var EmoticonsFilter = function(megaChat) {
    var self = this;

    var escapedRegExps = [];
    $.each(EMOJILIST.EMOJIS, function(slug, meta) {
        var txt = ":" + slug + ":";
        if (slug.substr(0, 1) == ":" || slug.substr(-1) == ":") {
            txt = "(^|\\W)(" + RegExpEscape(slug) + ")(?=(\\s|$))"
        }

        escapedRegExps.push(
            txt
        );
    });

    var regExpStr = "(" + escapedRegExps.join("|") + ")";
    self.emoticonsRegExp = new RegExp(regExpStr, "gi");

    megaChat.bind("onBeforeRenderMessage", function(e, eventData) {
        self.processMessage(e, eventData);
    });

    return this;
};

EmoticonsFilter.prototype.processMessage = function(e, eventData) {
    var self = this;

    // ignore if emoticons are already processed
    if (eventData.message.emoticonsProcessed === true) {
        return;
    }

    // use the HTML version of the message if such exists (the HTML version should be generated by hooks/filters on the
    // client side.
    var textContents;
    if (eventData.message.getContents) {
        textContents = eventData.message.getContents();
    } else {
        textContents = eventData.message.textContents;
    }


    var messageContents = eventData.message.messageHtml ? eventData.message.messageHtml : textContents;

    if (!messageContents) {
        return; // ignore, maybe its a system message (or composing/paused composing notification)
    }

    messageContents = messageContents.replace(self.emoticonsRegExp, function(match) {
        var foundSlug = $.trim(match.toLowerCase());
        var textSlug = foundSlug;

        if (foundSlug.substr(0, 1) === ":" && foundSlug.substr(-1, 1) === ":") {
            foundSlug = foundSlug.substr(1, foundSlug.length - 2);
        }
        if (!EMOJILIST.EMOJIS[foundSlug]) {
            foundSlug = ":" + foundSlug + ":";
        }
        var meta = EMOJILIST.EMOJIS[foundSlug];

        if (meta) {
            return '<span class="emojione-' + meta[0] + '" title="' + htmlentities(textSlug) + '">' + meta[1] + '</span>';
        } else {
            return match;
        }
    });

    eventData.message.messageHtml = messageContents;
    eventData.message.emoticonsProcessed = true;
};
