README

Simple ui to play some music when backhome (using dash button, kodi and iot switch).

I. Get the repository
--------------------
```
git clone https://github.com/alexandreLavenant/backhome.git
```
II. Installation
---------------
```
yarn install
yarn build
```
III. Configuration
---------------
```js
{
    "server" :
    {
        "port" : 3000,
        "auth" :
        {
            "cookieKeys" : ["", "", ""]
        },
        "user" :
        {
            "id" : "",
            "username" : "",
            "password" : ""
        }
    },
    "dash" :
    {
        "mac" : ""
    },
    "switch" :
    {
        "host" : "192.168.1.2"
    },
    "kodi" :
    {
        "host" : "192.168.1.3",
        "port" : 8080
    },
    "app" :
    {
        "music" :
        {
            "morning" :
            [
                "edezd",
                "fezfz"
            ],
            "evening" :
            [
                "fzdzedz"
            ]
        },
        "enable" : true
    }
}
```
IV. Run Program
---------------
```
yarn start
```