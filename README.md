README

Get the best news of hackernews.com.

I. Get the repository
--------------------
```
git clone https://github.com/alexandreLavenant/hackerNews.git
```
II. Installation
---------------
```js
yarn install
npm run build
```
III. Configuration
---------------
```
{
    "http" : {
        "port" : 2212,
        "id" : "",
        "user" : "",
        "password" : "",
        "cookieKeys" : ["", "", ""]
    },
    "plug" : "192.168.1.2",
    "kodi" : {
        "http" : "192.168.1.3",
        "port" : 8080,
        "music" : {
            "morning" : ["", ""],
            "evening" : [""]
        },
        "enable" : true
    }
}
```
IV. Run Program
---------------
```js
node backhome.js
```