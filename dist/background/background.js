chrome.runtime.onInstalled.addListener(e=>{"install"===e.reason||e.reason}),chrome.runtime.onMessage.addListener((e,n,s)=>("ping"===e.action&&s({status:"pong"}),!0));
