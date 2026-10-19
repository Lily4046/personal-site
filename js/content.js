/* ---------------------------------------------------------
   BG2HHW — 个人主页内容
   想改文字、链接或项目，只需要编辑这个文件。
   --------------------------------------------------------- */

window.SITE_CONTENT = {
  identity: {
    kicker: "AMATEUR RADIO · ENGINEERING · HARBIN",
    title:
      '把信号，<br>发向<span class="accent">更远</span>的<span class="title-tail">地方。</span>',
    lead:
      "我是 BG2HHW，一名在哈尔滨折腾电波、电路与网页的人。喜欢把看不见的信号，变成能被触摸、阅读和记住的东西。",
    primaryCta: { label: "看看作品", href: "#work" },
    secondaryCta: { label: "打个招呼", href: "#contact" },
    coordinates: "45°45′N / 126°38′E",
    grid: "PN46",
    status: "ON AIR / SOMETIMES",
    station: [
      ["CALLSIGN", "BG2HHW"],
      ["QTH", "HARBIN, CHINA"],
      ["GRID", "PN46"],
      ["BANDS", "HF · VHF · UHF"]
    ],
    ticker: [
      "业余无线电",
      "印刷设计",
      "前端开发",
      "工程实践",
      "航空航天",
      "卫星通信",
      "73"
    ]
  },

  about: {
    kicker: "01 / ABOUT",
    title: "在电波与纸张之间，<br>做一点具体的东西。",
    paragraphs: [
      "我在哈尔滨读书，也在这里接触业余无线电。呼号 <strong>BG2HHW</strong>。对我来说，无线电不只是一次通联，它还是一套很浪漫的工程语言：天线、传播、噪声、等待，以及从很远的地方收到一句「收到」。",
      "我也会写前端、做平面与印刷、参与社团和课程项目。喜欢把一个想法推到能真正运行、能印刷、能被人使用的程度。",
      "这个站点是一张长期更新的名片。放不下所有故事，但至少能留下一些坐标。"
    ],
    quote: "“CQ CQ CQ, this is BG2HHW.”",
    facts: [
      ["CALLSIGN", "BG2HHW"],
      ["QTH", "HARBIN, CHINA"],
      ["GRID", "PN46"],
      ["IARU", "REGION 3"],
      ["STATUS", "SOMETIMES ON AIR"]
    ]
  },

  work: {
    kicker: "02 / SELECTED WORK",
    title: "最近做过的一些事",
    intro:
      "从一张卡片到一台装置，都是把想法落到现实里的练习。这里放几件我自己愿意反复看的东西。",
    projects: [
      {
        index: "01",
        title: "QSL CARD / 2026",
        subtitle: "把一次通联，留在一张纸上。",
        description:
          "一套三款、双面印刷的 QSL 卡。以档案、共绘长卷与航海日志为题，从版式、图像重构到出血与印刷校验完整落地。",
        tags: ["平面设计", "排版", "印刷"],
        visual: "image",
        image: "assets/qsl-storm-log.webp",
        alt: "BG2HHW 2026 航海日志主题 QSL 卡正面设计",
        galleryKey: "qsl-2026",
        gallery: [
          {
            src: "assets/qsl-storm-log.webp",
            title: "C / STORM LOG",
            caption: "船舶电台日志 / 140 × 90 mm / 2026"
          },
          {
            src: "assets/qsl-archive.webp",
            title: "A / ARCHIVE",
            caption: "通联确认档案 / 140 × 90 mm / 2026"
          }
        ],
        link: "",
        meta: "3 DESIGNS / 140 × 90 MM / 2026",
        featured: true
      },
      {
        index: "02",
        title: "DRONE CONTROLLER",
        subtitle: "无人机飞行训练辅助遥控装置",
        description:
          "参与装置结构、交互与项目文档的整理，在真实的尺寸、成本与使用场景里，把一个课程想法做成可用的工程方案。",
        tags: ["工程实践", "硬件", "文档"],
        visual: "drone",
        link: "",
        meta: "ENGINEERING / 2025—2026",
        size: "half"
      },
      {
        index: "03",
        title: "70 YEARS OF SPACE",
        subtitle: "中国航天 70 周年活动视觉",
        description:
          "为业余无线电图像通联活动整理物料与信息层级，用版式、图像和一套可延展的视觉语言，让活动被更清楚地看见。",
        tags: ["活动视觉", "信息设计", "科普"],
        visual: "poster",
        link: "",
        meta: "VISUAL SYSTEM / 2026",
        size: "half"
      }
    ]
  },

  log: {
    kicker: "03 / FIELD LOG",
    title: "把过程也留下来",
    intro:
      "不只展示结果，也记下做东西时绕过的路、做过的取舍，以及还没完全想明白的部分。",
    entries: [
      {
        date: "2026 / QSL",
        tags: ["设计", "印刷"],
        title: "把一次通联做成一份档案",
        excerpt:
          "从一张参考图开始，拆出档案、共绘长卷和航海日志三种语气；再处理字体、网点、出血和裁切线，直到它可以被真正印出来。",
        action: {
          type: "gallery",
          label: "打开 QSL 画廊",
          galleryKey: "qsl-2026",
          projectTitle: "QSL CARD / 2026"
        }
      },
      {
        date: "2025—2026 / ENGINEERING",
        tags: ["硬件", "课程项目"],
        title: "无人机训练装置的工程取舍",
        excerpt:
          "结构、尺寸、成本和实际使用场景会互相拉扯。真正难的不是把东西做出来，而是解释为什么这样做，以及它为什么能工作。",
        action: {
          type: "link",
          label: "看项目卡片",
          href: "#work"
        }
      }
    ],
    qsl: {
      kicker: "QSL / DIRECT",
      title: "想交换一张卡？",
      text: "QSL VIA BG2HHW · DIRECT / BUREAU",
      galleryLabel: "查看卡片设计",
      qrzLabel: "QRZ / BG2HHW",
      href: "https://www.qrz.com/db/BG2HHW"
    }
  },

  now: {
    kicker: "05 / NOW",
    title: "此刻，正在发生",
    intro: "一些正在进行、还没完成的小事。",
    cards: [
      {
        label: "BUILDING",
        title: "正在做",
        items: ["个人主页的最后一版", "下一版 QSL 的构思", "几个还没命名的小工具"]
      },
      {
        label: "LEARNING",
        title: "正在学",
        items: ["CW 与摩尔斯电码", "天线匹配与传播", "让网页动得更自然"]
      },
      {
        label: "LISTENING",
        title: "正在听",
        items: ["7.023 MHz 的 CW", "145.800 MHz 的卫星下行", "硬盘里没听完的歌"]
      }
    ]
  },

  contact: {
    kicker: "06 / CONTACT",
    title: "保持联络。",
    lead:
      "想聊无线电、设计、代码，或者只是想交换一张 QSL 卡，都欢迎。信号不一定要很长，收到就好。",
    callsign: "BG2HHW",
    note: "QSL VIA BG2HHW · DIRECT / BUREAU",
    links: [
      {
        label: "BILIBILI",
        value: "哔哩哔哩主页",
        href: "https://space.bilibili.com/450550618"
      },
      {
        label: "GitHub",
        value: "GitHub 主页",
        href: "https://github.com/Lily4046"
      },
      {
        label: "QRZ",
        value: "QRZ 呼号页",
        href: "https://www.qrz.com/db/BG2HHW"
      }
    ]
  }
};
