var msParser = (function()
{
    function MsParser()
    {
    }

    MsParser.prototype = {

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
                    var re = /span.*?lblCaseName.*?>(.*?)<\/span>[\S\s]*?span.*?lblDocket.*?>(.*?)<\/span>[\S\s]*?span.*?lblDate.*?>(.*?)<\/span>/;
                    var m = obj.body.match(re);

                    var title = m[1];
                    var docket = m[2];
                    var date = m[3];

                    re = /alt=['"]MP3['"][\s\S]*?href=['"](.*?\.mp3)['"][\s\S]*?alt=['"]PDF['"][\s\S]*?href=['"](.*?\.pdf)['"]/;
                    m = obj.body.match(re);

                    var mp3url = qtJsTools.resolvedUrl(m[1], obj.url);
                    var pdfurl = qtJsTools.resolvedUrl(m[2], obj.url);

                    let fmt = {
                        url: mp3url,
                        ext: "mp3",
                        protocol: "https",
                        audio_ext: "mp3",
                        format: "mp3"
                    };

                    let enUsSubtitles = {
                        ext: "pdf",
                        url: pdfurl,
                        name: "English"
                    };

                    let result = {
                        id: docket, // optional parameter
                        title: title,
                        webpage_url: obj.url,
                        upload_date: convertDate(date),
                        formats: [fmt],
                        subtitles: {"en_US": [enUsSubtitles]}
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
            return /^https?:\/\/(www.)?supremecourt.gov\/oral_arguments\/audio\/\d{4}\/\d+-\d+$/.test(url);
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

    return new MsParser();
}());

function convertDate(date)
{
    var m = date.match(/(\d{1,2})\/(\d{1,2})\/(\d{1,4})/);
    var month = m[1];
    var day = m[2];
    var year = m[3];
    if (year.length === 2)
        year = "20" + year;
    else if (year.length === 1)
        year = "200" + year;
    return year + "-" + month + "-" + day;
}
