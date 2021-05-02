/**
 * WebRequest API:
 * https://developer.chrome.com/extensions/webRequest
 *
 * How to match urls in chrome:
 * https://developer.chrome.com/extensions/match_patterns
 */

// little utility for "chrome.webRequest.onBeforeRequest" with a few defaults
const onBeforeRequest = (cb, { urls, types = ['main_frame'] }, options = ['blocking']) => {
  chrome.webRequest.onBeforeRequest.addListener(cb, { urls, types }, options);
};

// redirect to videos page when "first" visiting a youtube channel
onBeforeRequest(
  ({ url }) => {
    // url has only 4 slashes, means that no subpage of channel is selected, so you can navigate to '/featured', '/playlist' and stuff
    if (url.split('/').length === 5) {
      const newUrl = new URL(url);
      newUrl.pathname += '/videos';

      // to select the upload section on (only big?!) music channels
      newUrl.searchParams.set('view', '0');

      return { redirectUrl: newUrl.href };
    }
  },
  {
    urls: [
      'https://www.youtube.com/channel/*',
      'https://www.youtube.com/c/*',
      'https://www.youtube.com/user/*',
    ],
    types: ['main_frame', 'xmlhttprequest'],
  },
);

// redirect to mobile wikipedia version
onBeforeRequest(
  ({ url }) => {
    if (!url.includes('.m.wikipedia.org')) {
      return { redirectUrl: url.replace('.wikipedia.org', '.m.wikipedia.org') };
    }
  },
  { urls: ['https://*.wikipedia.org/*/*'] },
);

// redirect to non mobile imdb version because imdb sometimes links to mobile version or something
onBeforeRequest(
  ({ url }) => {
    return { redirectUrl: url.replace('https://m.', 'https://') };
  },
  { urls: ['https://m.imdb.com/*'] },
);

// redirect to best twitter image version
onBeforeRequest(
  ({ url }) => {
    const newUrl = new URL(url);

    newUrl.searchParams.set('name', 'orig');

    return { redirectUrl: newUrl.href };
  },
  { urls: ['https://pbs.twimg.com/media/*'] },
);

// redirect to best soundcloud image version
onBeforeRequest(
  ({ url }) => {
    return { redirectUrl: url.replace('-t500x500', '-original') };
  },
  { urls: ['https://*.sndcdn.com/artworks-*'] },
);

// redirect german mdn version to english mdn version
onBeforeRequest(
  ({ url }) => {
    return {
      redirectUrl: url.replace(
        'https://developer.mozilla.org/de',
        'https://developer.mozilla.org/en-US',
      ),
    };
  },
  { urls: ['https://developer.mozilla.org/de/*'] },
);

// redirect urls that just redirect to another url (order is important when one url contains the other)
['https://www.pixiv.net/jump.php?url=', 'https://www.pixiv.net/jump.php?'].forEach((urlStart) => {
  onBeforeRequest(
    ({ url }) => {
      return { redirectUrl: decodeURIComponent(url.replace(urlStart, '')) };
    },
    { urls: [`${urlStart}*`] },
  );
});

// artstation custom artist page to normal artist page
onBeforeRequest(
  ({ url }) => {
    if (!url.startsWith(`https://www.`)) {
      return { redirectUrl: `https://artstation.com/${url.substr(7).split('.')[0]}` };
    }
  },
  { urls: ['https://*.artstation.com/'] },
);

// artstation custom artist art page to normal art page
onBeforeRequest(
  ({ url }) => {
    return { redirectUrl: `https://artstation.com/artwork/${url.split('/').pop()}` };
  },
  { urls: ['https://*.artstation.com/projects/*'] },
);
