import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*"]
}

interface Profile {
  userId: string
  gmail: string
  agentname: string
  bio: string
  level: number
  experience: number
  nextLevelExp: number
  points: number
  tweetProfile: TweetProfile
  agentCfg: AgentCfg
  twitterWatchList: TwitterWatchList[]
  tweetFrequency: TweetFrequency
  stats: Stats
}

interface TweetProfile {
  username: string
  email: string
  avatar: string
  code: string
  codeVerifier: string
  accessToken: string
  refreshToken: string
  expiresIn: number
}

interface AgentCfg {
  enabled: boolean
  interval: string
  imitate: string
}

interface TwitterWatchList {
  username: string
  name: string
  avatar: string
}

interface TweetFrequency {
  dailyLimit: number
  currentCount: number
  lastTweetTime: number
}

interface Stats {
  totalTweets: number
  successfulTweets: number
  failedTweets: number
}

const XKolList = () => {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const [path, setPath] = useState<string>(window.location.pathname)
  const [profile, setProfile] = useState<Profile | null>(null)

  const onWatch = () => {
    const isWatch = profile?.twitterWatchList.find(
      (item) => item.username === path.substring(1)
    )
    const dom = document.querySelector(
      '[data-testid="UserName"]'
    ) as HTMLElement | null
    //  dom的前一个兄弟元素
    const img = dom?.previousElementSibling.querySelector(
      'img[src^="https://pbs.twimg.com/profile_images"]'
    )
    console.log(img)

    fetch(
      "https://halpha.halagent.org/dev/ea9dcd13-2e43-0b17-9674-fe240b2e5fd3/profile_upd",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: profile?.userId,
          profile: {
            ...profile,
            twitterWatchList: isWatch
              ? profile?.twitterWatchList.filter(
                  (item) => item.username !== path.substring(1)
                )
              : [
                  // eslint-disable-next-line no-unsafe-optional-chaining
                  ...profile?.twitterWatchList,
                  {
                    name: dom?.textContent.split("@")[0],
                    username: path.substring(1),
                    avatar: img?.getAttribute("src")
                  }
                ]
          }
        })
      }
    ).then((res) => {
      res.json().then((res) => {
        if (res.success) {
          setProfile(res.profile)
        }
      })
    })
  }
  useEffect(() => {
    chrome.storage.local.get("userInfo").then((res) => {
      if (res.userInfo) {
        const userInfo = JSON.parse(res.userInfo)
        console.log(userInfo)
        fetch(
          "https://halpha.halagent.org/dev/ea9dcd13-2e43-0b17-9674-fe240b2e5fd3/profile",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              userId: userInfo.userId
            })
          }
        ).then((res) => {
          res.json().then((data) => {
            console.warn(data)
            setProfile(data.profile)
          })
        })
      } else {
        console.log("no login")
      }
    })

    const findContainer = () => {
      const dom = document.querySelector(
        '[data-testid="UserName"]'
      ) as HTMLElement | null
      if (dom) {
        setContainer(dom)
        return true
      }
      return false
    }

    if (findContainer()) return

    const observer = new MutationObserver(() => {
      if (findContainer()) {
        observer.disconnect()
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [path])

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.location.pathname !== path) {
        setPath(window.location.pathname)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [path])

  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
     .hal-watch-btn{
        width: 68px;
        height: 22px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 16px;
        border: 1px solid rgba(0, 0, 0, 0);
        color: rgb(0, 0, 0);
        font-family: 'GeologicaRegular';
        font-size: 12px;
        user-select: none;
        margin-right: 4px;
        background-color: rgb(239, 243, 244);
        cursor:pointer;

     }
    .btn-scale {
        cursor: pointer;
        transition: all 0.1s;
    }
    .btn-scale:hover {
        transform: scale(1.05);
    }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return container && profile?.twitterWatchList
    ? createPortal(
        <div className="hal-watch-btn btn-scale" onClick={onWatch}>
          {profile.twitterWatchList.find(
            (item) => item.username === path.substring(1)
          )
            ? "UnWatch"
            : "Watch"}
        </div>,
        container
      )
    : null
}

export default XKolList
