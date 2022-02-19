/* Parse playlists */

var msBatchVideoParser = (function()
{
    function MsBatchVideoParser()
    {
    }

    MsBatchVideoParser.prototype = {

        parse: function (obj)
        {
            return downloadUrlAsUtf8Text(obj.url, obj.cookie)
            .then(this.parseContent);
        },

        parseContent: function (obj)
        {
            return new Promise(function(resolve, reject)
            {
                try
                {
                    var re = /<table.*?>[\s\S]*?<tr>[\s\S]*?<th.*?>*.?Oral Argument.*?<\/th>[\s\S]*?<th.*?>*.?Date Argued.*?<\/th>[\s\S]*?<\/tr>([\s\S]*?)<\/table>/g;
                    var re2 = /<a.*?href=['"](.*?)['"][\s\S]*?<span.*?>(.*?)<\/span>/g;
                    var reTitle = /lblListTitle.*?>(.*?)<\//;

                    var playlistTitle = obj.body.match(reTitle)[1].trim();
                    var entries = [];

                    var m;

                    while (m = re.exec(obj.body))
                    {
                        var m2;

                        while (m2 = re2.exec(m[1]))
                        {
                            var url = qtJsTools.resolvedUrl(m2[1], obj.url);
                            if (!msParser.isSupportedSource(url))
                                continue;
                            var title = m2[2];
                            entries.push({
                                             _type: "url",
                                             url: url,
                                             title: title
                                         });
                        }
                    }

                    let result = {
                        _type: "playlist",
                        title: playlistTitle,
                        webpage_url: obj.url,
                        entries: entries
                    };

                    resolve(result);
                }
                catch (e)
                {
                    reject({error: e.message, isParseError: true});
                }
            });
        },

        isSupportedSource: function(url)
        {
            return /^https?:\/\/(www.)?supremecourt.gov\/oral_arguments\/argument_audio\/\d{4}$/.test(url);
        },

        supportedSourceCheckPriority: function()
        {
            return 65535;
        },

        isPossiblySupportedSource: function(obj)
        {
            return false;
        },

        minIntevalBetweenQueryInfoDownloads: function()
        {
            return 300;
        }
    };

    return new MsBatchVideoParser();
}());
