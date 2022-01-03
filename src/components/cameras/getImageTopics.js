/*
list format:
<ul>
    <li>
        {topic_prefix}
        <ul>
            <li><a href="{link_to_video_stream}">{topic_suffix}</a> (<a href="{link_to_snapshot}">Snapshot</a>)</li>
        </ul>
        ...
    </li>
    ...
</ul>
*/

export default async (videoServerUrl) => {
    const rawData = await fetch(videoServerUrl).then((response) =>
        response.text()
    )
    const parser = new DOMParser()
    const htmlDoc = parser.parseFromString(rawData, 'text/html')
    const topicList = Array.from(
        // gets the list of topic groups
        htmlDoc.getElementsByTagName('ul')[0].childNodes
    )
        // extract prefix and <ul> grouping topic suffixes
        .map((elem) => Array.from(elem.childNodes))
        // ignore topic prefix
        .map(
            ([, nodes]) =>
                // get all <li> elements inside the topic group
                Array.from(nodes.childNodes)
                    .map((listItem) => listItem.firstChild) // get the first <a>
                    .map((link) => link.href) // extract the url from the <a>
                    .map((url) => new URL(url).searchParams.get('topic')) // get the topic from parameters
        )
        // combine resulting arrays into a single one
        .reduce((prev, curr) => [...prev, ...curr], [])

    return topicList
}
