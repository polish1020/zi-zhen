// Twenty authored chapters. Encounter archetypes reuse the same combat rules and counters.
export const CAMPAIGN_ADDITIONS = [
 {
  "name": "桃源春渡",
  "area": "桃花汀",
  "rounds": 15,
  "hp": 34,
  "ink": 460,
  "difficulty": 1.444,
  "intro": "花枝与飞蝶交替来袭，兼顾治疗与空路。",
  "theme": "peach",
  "night": false,
  "accent": "#b77889",
  "color": "#eadfe0",
  "mode": "staggered",
  "routes": [
   [
    [
     -30,
     100
    ],
    [
     250,
     100
    ],
    [
     250,
     270
    ],
    [
     460,
     270
    ],
    [
     460,
     80
    ],
    [
     680,
     80
    ],
    [
     680,
     430
    ],
    [
     940,
     430
    ]
   ],
   [
    [
     -30,
     450
    ],
    [
     170,
     450
    ],
    [
     170,
     340
    ],
    [
     460,
     340
    ],
    [
     460,
     270
    ],
    [
     680,
     270
    ],
    [
     680,
     430
    ],
    [
     940,
     430
    ]
   ]
  ],
  "pads": [
   [
    550,
    220
   ],
   [
    165,
    265
   ],
   [
    715,
    310
   ],
   [
    330,
    220
   ],
   [
    605,
    355
   ],
   [
    55,
    265
   ],
   [
    495,
    355
   ],
   [
    550,
    130
   ],
   [
    825,
    310
   ],
   [
    275,
    400
   ],
   [
    165,
    175
   ],
   [
    550,
    445
   ],
   [
    385,
    130
   ],
   [
    715,
    490
   ],
   [
    110,
    355
   ],
   [
    715,
    220
   ]
  ],
  "minions": [
   {
    "kind": "peach_0",
    "name": "桃枝灵",
    "base": "scrollscribe"
   },
   {
    "kind": "peach_1",
    "name": "落英蝶",
    "base": "hillkite"
   },
   {
    "kind": "peach_2",
    "name": "桃甲卫",
    "base": "ironvanguard"
   }
  ],
  "bosses": [
   {
    "kind": "peach_boss_0",
    "name": "桃源花君",
    "base": "bamboowitch"
   },
   {
    "kind": "peach_boss_1",
    "name": "绯羽蝶后",
    "base": "thunderkite"
   },
   {
    "kind": "peach_boss_2",
    "name": "桃根古灵",
    "base": "stonewarden"
   }
  ]
 },
 {
  "name": "荷塘月色",
  "area": "荷风浦",
  "rounds": 15,
  "hp": 34,
  "ink": 460,
  "difficulty": 1.49,
  "intro": "两岸同时进军，雷霆破盾，远射守住荷塘上空。",
  "theme": "lotus",
  "night": false,
  "accent": "#68998d",
  "color": "#dce9e2",
  "mode": "simultaneous",
  "routes": [
   [
    [
     90,
     -30
    ],
    [
     90,
     200
    ],
    [
     350,
     200
    ],
    [
     350,
     80
    ],
    [
     680,
     80
    ],
    [
     680,
     260
    ],
    [
     940,
     260
    ]
   ],
   [
    [
     90,
     550
    ],
    [
     90,
     380
    ],
    [
     350,
     380
    ],
    [
     350,
     480
    ],
    [
     680,
     480
    ],
    [
     680,
     260
    ],
    [
     940,
     260
    ]
   ]
  ],
  "pads": [
   [
    715,
    310
   ],
   [
    220,
    310
   ],
   [
    605,
    220
   ],
   [
    220,
    85
   ],
   [
    495,
    400
   ],
   [
    715,
    220
   ],
   [
    275,
    445
   ],
   [
    495,
    220
   ],
   [
    605,
    310
   ],
   [
    110,
    310
   ],
   [
    715,
    130
   ],
   [
    330,
    310
   ],
   [
    605,
    400
   ],
   [
    495,
    130
   ],
   [
    770,
    400
   ],
   [
    55,
    220
   ]
  ],
  "minions": [
   {
    "kind": "lotus_0",
    "name": "莲甲卒",
    "base": "shellmite"
   },
   {
    "kind": "lotus_1",
    "name": "荷叶舟",
    "base": "tideshaper"
   },
   {
    "kind": "lotus_2",
    "name": "荧荷蜓",
    "base": "cloudmender"
   }
  ],
  "bosses": [
   {
    "kind": "lotus_boss_0",
    "name": "莲台守主",
    "base": "pearlclam"
   },
   {
    "kind": "lotus_boss_1",
    "name": "月莲灵妃",
    "base": "dreamweaver"
   },
   {
    "kind": "lotus_boss_2",
    "name": "翠羽鹭王",
    "base": "cloudwhale"
   }
  ]
 },
 {
  "name": "杏林听雨",
  "area": "杏雨村",
  "rounds": 16,
  "hp": 34,
  "ink": 480,
  "difficulty": 1.535,
  "intro": "雨幕掩护医者与跃进轻兵，毒伤可阻止急救。",
  "theme": "rain",
  "night": false,
  "accent": "#839ba6",
  "color": "#e0e7e8",
  "mode": "single",
  "routes": [
   [
    [
     -30,
     120
    ],
    [
     350,
     120
    ],
    [
     350,
     410
    ],
    [
     140,
     410
    ],
    [
     140,
     270
    ],
    [
     710,
     270
    ],
    [
     710,
     440
    ],
    [
     940,
     440
    ]
   ]
  ],
  "pads": [
   [
    220,
    220
   ],
   [
    275,
    310
   ],
   [
    605,
    355
   ],
   [
    385,
    310
   ],
   [
    110,
    220
   ],
   [
    770,
    265
   ],
   [
    385,
    220
   ],
   [
    660,
    445
   ],
   [
    275,
    445
   ],
   [
    220,
    85
   ],
   [
    495,
    355
   ],
   [
    55,
    310
   ],
   [
    385,
    130
   ],
   [
    770,
    355
   ],
   [
    385,
    400
   ],
   [
    495,
    175
   ]
  ],
  "minions": [
   {
    "kind": "rain_0",
    "name": "雨笠客",
    "base": "healer"
   },
   {
    "kind": "rain_1",
    "name": "纸伞雀",
    "base": "gearglider"
   },
   {
    "kind": "rain_2",
    "name": "杏枝童",
    "base": "tideskipper"
   }
  ],
  "bosses": [
   {
    "kind": "rain_boss_0",
    "name": "杏林药祖",
    "base": "bamboowitch"
   },
   {
    "kind": "rain_boss_1",
    "name": "听雨伞仙",
    "base": "inkarchivist"
   },
   {
    "kind": "rain_boss_2",
    "name": "霁光鹤王",
    "base": "thunderkite"
   }
  ]
 },
 {
  "name": "黄沙古道",
  "area": "流沙关",
  "rounds": 16,
  "hp": 34,
  "ink": 480,
  "difficulty": 1.581,
  "intro": "流沙两路交替，重甲拖住火力，飞隼直取山门。",
  "theme": "desert",
  "night": false,
  "accent": "#b3975e",
  "color": "#eee3cc",
  "mode": "staggered",
  "routes": [
   [
    [
     -30,
     100
    ],
    [
     320,
     100
    ],
    [
     320,
     310
    ],
    [
     560,
     310
    ],
    [
     560,
     190
    ],
    [
     750,
     190
    ],
    [
     750,
     420
    ],
    [
     940,
     420
    ]
   ],
   [
    [
     -30,
     460
    ],
    [
     220,
     460
    ],
    [
     220,
     190
    ],
    [
     440,
     190
    ],
    [
     440,
     420
    ],
    [
     750,
     420
    ],
    [
     940,
     420
    ]
   ]
  ],
  "pads": [
   [
    385,
    265
   ],
   [
    605,
    310
   ],
   [
    165,
    265
   ],
   [
    715,
    310
   ],
   [
    275,
    265
   ],
   [
    330,
    355
   ],
   [
    165,
    175
   ],
   [
    495,
    265
   ],
   [
    825,
    355
   ],
   [
    165,
    355
   ],
   [
    495,
    355
   ],
   [
    825,
    265
   ],
   [
    440,
    130
   ],
   [
    165,
    40
   ],
   [
    55,
    355
   ],
   [
    715,
    490
   ]
  ],
  "minions": [
   {
    "kind": "desert_0",
    "name": "沙甲兵",
    "base": "stonebadger"
   },
   {
    "kind": "desert_1",
    "name": "沙行蜥",
    "base": "hillrunner"
   },
   {
    "kind": "desert_2",
    "name": "砂羽隼",
    "base": "thunderchick"
   }
  ],
  "bosses": [
   {
    "kind": "desert_boss_0",
    "name": "流沙巨像",
    "base": "stonewarden"
   },
   {
    "kind": "desert_boss_1",
    "name": "沙海祭司",
    "base": "bamboowitch"
   },
   {
    "kind": "desert_boss_2",
    "name": "黄沙鹰皇",
    "base": "cloudboss"
   }
  ]
 },
 {
  "name": "断崖栈道",
  "area": "绝壁栈",
  "rounds": 17,
  "hp": 36,
  "ink": 500,
  "difficulty": 1.626,
  "intro": "地面绕行栈道，空中越过断崖，前后都要布防。",
  "theme": "cliff",
  "night": false,
  "accent": "#92907a",
  "color": "#e3e2d9",
  "mode": "single",
  "routes": [
   [
    [
     -30,
     410
    ],
    [
     200,
     410
    ],
    [
     200,
     110
    ],
    [
     470,
     110
    ],
    [
     470,
     380
    ],
    [
     700,
     380
    ],
    [
     700,
     180
    ],
    [
     940,
     180
    ]
   ]
  ],
  "pads": [
   [
    330,
    265
   ],
   [
    605,
    220
   ],
   [
    110,
    265
   ],
   [
    770,
    310
   ],
   [
    330,
    175
   ],
   [
    605,
    310
   ],
   [
    110,
    355
   ],
   [
    770,
    220
   ],
   [
    330,
    40
   ],
   [
    275,
    355
   ],
   [
    385,
    355
   ],
   [
    550,
    130
   ],
   [
    880,
    310
   ],
   [
    165,
    175
   ],
   [
    605,
    445
   ],
   [
    165,
    445
   ]
  ],
  "minions": [
   {
    "kind": "cliff_0",
    "name": "岩脊兽",
    "base": "frostcrab"
   },
   {
    "kind": "cliff_1",
    "name": "栈道猿",
    "base": "hillrunner"
   },
   {
    "kind": "cliff_2",
    "name": "崖风雕",
    "base": "hillkite"
   }
  ],
  "bosses": [
   {
    "kind": "cliff_boss_0",
    "name": "断崖山君",
    "base": "hillboss"
   },
   {
    "kind": "cliff_boss_1",
    "name": "千钧石灵",
    "base": "stonewarden"
   },
   {
    "kind": "cliff_boss_2",
    "name": "凌崖羽王",
    "base": "thunderkite"
   }
  ]
 },
 {
  "name": "松涛古寺",
  "area": "寒松寺",
  "rounds": 16,
  "hp": 36,
  "ink": 500,
  "difficulty": 1.596,
  "intro": "古寺双门齐开，护盾与法术守卫互相掩护。",
  "theme": "temple",
  "night": false,
  "accent": "#83936a",
  "color": "#e2e7db",
  "mode": "simultaneous",
  "routes": [
   [
    [
     -30,
     90
    ],
    [
     260,
     90
    ],
    [
     260,
     220
    ],
    [
     120,
     220
    ],
    [
     120,
     420
    ],
    [
     560,
     420
    ],
    [
     560,
     270
    ],
    [
     940,
     270
    ]
   ],
   [
    [
     -30,
     470
    ],
    [
     380,
     470
    ],
    [
     380,
     90
    ],
    [
     700,
     90
    ],
    [
     700,
     420
    ],
    [
     800,
     420
    ],
    [
     800,
     270
    ],
    [
     940,
     270
    ]
   ]
  ],
  "pads": [
   [
    275,
    310
   ],
   [
    660,
    220
   ],
   [
    440,
    265
   ],
   [
    770,
    220
   ],
   [
    165,
    355
   ],
   [
    220,
    175
   ],
   [
    550,
    220
   ],
   [
    660,
    355
   ],
   [
    165,
    265
   ],
   [
    440,
    355
   ],
   [
    110,
    175
   ],
   [
    770,
    130
   ],
   [
    330,
    220
   ],
   [
    55,
    400
   ],
   [
    660,
    445
   ],
   [
    550,
    130
   ]
  ],
  "minions": [
   {
    "kind": "temple_0",
    "name": "木鱼僧",
    "base": "ward"
   },
   {
    "kind": "temple_1",
    "name": "古松甲",
    "base": "bambooent"
   },
   {
    "kind": "temple_2",
    "name": "禅羽雀",
    "base": "scrollwisp"
   }
  ],
  "bosses": [
   {
    "kind": "temple_boss_0",
    "name": "寒松禅师",
    "base": "silencewarden"
   },
   {
    "kind": "temple_boss_1",
    "name": "钟楼金刚",
    "base": "stonewarden"
   },
   {
    "kind": "temple_boss_2",
    "name": "云禅鹤尊",
    "base": "cloudwhale"
   }
  ]
 },
 {
  "name": "莲灯夜市",
  "area": "流灯街",
  "rounds": 17,
  "hp": 36,
  "ink": 510,
  "difficulty": 1.657,
  "intro": "三条灯街轮番出兵，鼓舞与薄盾护送飞燕。",
  "theme": "lantern",
  "night": true,
  "accent": "#c39566",
  "color": "#343f49",
  "mode": "staggered",
  "routes": [
   [
    [
     -30,
     80
    ],
    [
     210,
     80
    ],
    [
     210,
     270
    ],
    [
     470,
     270
    ],
    [
     470,
     140
    ],
    [
     710,
     140
    ],
    [
     710,
     410
    ],
    [
     940,
     410
    ]
   ],
   [
    [
     -30,
     450
    ],
    [
     100,
     450
    ],
    [
     100,
     340
    ],
    [
     470,
     340
    ],
    [
     470,
     270
    ],
    [
     710,
     270
    ],
    [
     710,
     410
    ],
    [
     940,
     410
    ]
   ],
   [
    [
     480,
     -30
    ],
    [
     480,
     50
    ],
    [
     330,
     50
    ],
    [
     330,
     180
    ],
    [
     590,
     180
    ],
    [
     590,
     270
    ],
    [
     710,
     270
    ],
    [
     710,
     410
    ],
    [
     940,
     410
    ]
   ]
  ],
  "pads": [
   [
    550,
    310
   ],
   [
    330,
    220
   ],
   [
    660,
    310
   ],
   [
    770,
    265
   ],
   [
    165,
    220
   ],
   [
    550,
    220
   ],
   [
    385,
    130
   ],
   [
    660,
    400
   ],
   [
    55,
    265
   ],
   [
    770,
    355
   ],
   [
    495,
    85
   ],
   [
    660,
    220
   ],
   [
    275,
    400
   ],
   [
    275,
    130
   ],
   [
    550,
    400
   ],
   [
    770,
    445
   ]
  ],
  "minions": [
   {
    "kind": "lantern_0",
    "name": "提灯客",
    "base": "hornacolyte"
   },
   {
    "kind": "lantern_1",
    "name": "彩纸燕",
    "base": "gearglider"
   },
   {
    "kind": "lantern_2",
    "name": "灯罩卫",
    "base": "pennantguard"
   }
  ],
  "bosses": [
   {
    "kind": "lantern_boss_0",
    "name": "千灯城主",
    "base": "embermarshal"
   },
   {
    "kind": "lantern_boss_1",
    "name": "火树灯灵",
    "base": "emberbeast"
   },
   {
    "kind": "lantern_boss_2",
    "name": "游灯夜凰",
    "base": "icephoenix"
   }
  ],
  "airRoutes": [
   [
    [
     -30,
     80
    ],
    [
     940,
     410
    ]
   ],
   [
    [
     -30,
     450
    ],
    [
     940,
     410
    ]
   ],
   [
    [
     480,
     -30
    ],
    [
     440,
     300
    ],
    [
     940,
     410
    ]
   ]
  ]
 },
 {
  "name": "沧浪渡海",
  "area": "听潮湾",
  "rounds": 17,
  "hp": 36,
  "ink": 520,
  "difficulty": 1.702,
  "intro": "海湾双路并进，潮盾与隐匿飞兵组成护送阵。",
  "theme": "ocean",
  "night": false,
  "accent": "#5f9eab",
  "color": "#dbe8e9",
  "mode": "simultaneous",
  "routes": [
   [
    [
     -30,
     130
    ],
    [
     230,
     130
    ],
    [
     230,
     330
    ],
    [
     460,
     330
    ],
    [
     460,
     90
    ],
    [
     730,
     90
    ],
    [
     730,
     260
    ],
    [
     940,
     260
    ]
   ],
   [
    [
     -30,
     460
    ],
    [
     130,
     460
    ],
    [
     130,
     270
    ],
    [
     370,
     270
    ],
    [
     370,
     440
    ],
    [
     730,
     440
    ],
    [
     730,
     260
    ],
    [
     940,
     260
    ]
   ]
  ],
  "pads": [
   [
    605,
    265
   ],
   [
    275,
    400
   ],
   [
    275,
    175
   ],
   [
    660,
    355
   ],
   [
    55,
    265
   ],
   [
    550,
    355
   ],
   [
    770,
    220
   ],
   [
    385,
    220
   ],
   [
    165,
    310
   ],
   [
    660,
    175
   ],
   [
    495,
    265
   ],
   [
    165,
    220
   ],
   [
    770,
    310
   ],
   [
    440,
    400
   ],
   [
    770,
    130
   ],
   [
    165,
    400
   ]
  ],
  "minions": [
   {
    "kind": "ocean_0",
    "name": "浪纹卒",
    "base": "tideshaper"
   },
   {
    "kind": "ocean_1",
    "name": "砗磲卫",
    "base": "tideclam"
   },
   {
    "kind": "ocean_2",
    "name": "海雾鸥",
    "base": "duskwing"
   }
  ],
  "bosses": [
   {
    "kind": "ocean_boss_0",
    "name": "沧浪龙君",
    "base": "tideboss"
   },
   {
    "kind": "ocean_boss_1",
    "name": "玄潮巨鲸",
    "base": "cloudwhale"
   },
   {
    "kind": "ocean_boss_2",
    "name": "珊瑚甲尊",
    "base": "pearlclam"
   }
  ]
 },
 {
  "name": "赤焰丹炉",
  "area": "离火炉",
  "rounds": 18,
  "hp": 38,
  "ink": 530,
  "difficulty": 1.748,
  "intro": "炉道交叉火力拆卸机关，避免只用一种元素。",
  "theme": "forge",
  "night": false,
  "accent": "#b17b60",
  "color": "#e9ddd2",
  "mode": "single",
  "routes": [
   [
    [
     -30,
     90
    ],
    [
     680,
     90
    ],
    [
     680,
     240
    ],
    [
     250,
     240
    ],
    [
     250,
     440
    ],
    [
     770,
     440
    ],
    [
     770,
     320
    ],
    [
     940,
     320
    ]
   ]
  ],
  "pads": [
   [
    495,
    175
   ],
   [
    440,
    355
   ],
   [
    715,
    265
   ],
   [
    220,
    175
   ],
   [
    605,
    355
   ],
   [
    330,
    175
   ],
   [
    330,
    355
   ],
   [
    715,
    355
   ],
   [
    605,
    175
   ],
   [
    110,
    175
   ],
   [
    715,
    175
   ],
   [
    165,
    265
   ],
   [
    495,
    40
   ],
   [
    440,
    490
   ],
   [
    275,
    40
   ],
   [
    825,
    265
   ]
  ],
  "minions": [
   {
    "kind": "forge_0",
    "name": "余烬甲",
    "base": "emberscout"
   },
   {
    "kind": "forge_1",
    "name": "赤炉蜂",
    "base": "thunderchick"
   },
   {
    "kind": "forge_2",
    "name": "铜锤侍",
    "base": "gearroller"
   }
  ],
  "bosses": [
   {
    "kind": "forge_boss_0",
    "name": "离火炉主",
    "base": "ballistalord"
   },
   {
    "kind": "forge_boss_1",
    "name": "赤铜焰兽",
    "base": "emberbeast"
   },
   {
    "kind": "forge_boss_2",
    "name": "流焰金乌",
    "base": "sunsovereign"
   }
  ]
 },
 {
  "name": "龙门听瀑",
  "area": "龙门涧",
  "rounds": 18,
  "hp": 38,
  "ink": 540,
  "difficulty": 1.794,
  "intro": "瀑布三径轮换出兵，薄壳、潜行与俯冲相互补位。",
  "theme": "waterfall",
  "night": false,
  "accent": "#6b9c9c",
  "color": "#dee9e6",
  "mode": "staggered",
  "routes": [
   [
    [
     -30,
     80
    ],
    [
     220,
     80
    ],
    [
     220,
     230
    ],
    [
     80,
     230
    ],
    [
     80,
     440
    ],
    [
     550,
     440
    ],
    [
     550,
     320
    ],
    [
     790,
     320
    ],
    [
     790,
     120
    ],
    [
     940,
     120
    ]
   ],
   [
    [
     -30,
     490
    ],
    [
     350,
     490
    ],
    [
     350,
     300
    ],
    [
     220,
     300
    ],
    [
     220,
     160
    ],
    [
     550,
     160
    ],
    [
     550,
     320
    ],
    [
     790,
     320
    ],
    [
     790,
     120
    ],
    [
     940,
     120
    ]
   ],
   [
    [
     460,
     -30
    ],
    [
     460,
     70
    ],
    [
     700,
     70
    ],
    [
     700,
     230
    ],
    [
     380,
     230
    ],
    [
     380,
     320
    ],
    [
     790,
     320
    ],
    [
     790,
     120
    ],
    [
     940,
     120
    ]
   ]
  ],
  "pads": [
   [
    660,
    175
   ],
   [
    275,
    355
   ],
   [
    605,
    265
   ],
   [
    495,
    265
   ],
   [
    165,
    265
   ],
   [
    715,
    265
   ],
   [
    165,
    400
   ],
   [
    440,
    355
   ],
   [
    825,
    265
   ],
   [
    275,
    265
   ],
   [
    825,
    175
   ],
   [
    165,
    175
   ],
   [
    605,
    355
   ],
   [
    385,
    85
   ],
   [
    770,
    85
   ],
   [
    715,
    355
   ]
  ],
  "minions": [
   {
    "kind": "waterfall_0",
    "name": "瀑石兽",
    "base": "shellmite"
   },
   {
    "kind": "waterfall_1",
    "name": "溪影客",
    "base": "bamboodart"
   },
   {
    "kind": "waterfall_2",
    "name": "龙瀑燕",
    "base": "cloudraptor"
   }
  ],
  "bosses": [
   {
    "kind": "waterfall_boss_0",
    "name": "龙门瀑尊",
    "base": "tideboss"
   },
   {
    "kind": "waterfall_boss_1",
    "name": "白练蛟王",
    "base": "cloudwhale"
   },
   {
    "kind": "waterfall_boss_2",
    "name": "磐瀑巨卫",
    "base": "glaciergolem"
   }
  ],
  "airRoutes": [
   [
    [
     -30,
     80
    ],
    [
     940,
     120
    ]
   ],
   [
    [
     -30,
     490
    ],
    [
     940,
     120
    ]
   ],
   [
    [
     460,
     -30
    ],
    [
     430,
     380
    ],
    [
     940,
     120
    ]
   ]
  ]
 },
 {
  "name": "稻香秋收",
  "area": "丰禾野",
  "rounds": 17,
  "hp": 38,
  "ink": 540,
  "difficulty": 1.733,
  "intro": "田埂交错，轻兵冲锋与护旗卫一同护送谷主。",
  "theme": "harvest",
  "night": false,
  "accent": "#a79b61",
  "color": "#eae6d3",
  "mode": "staggered",
  "routes": [
   [
    [
     -30,
     110
    ],
    [
     220,
     110
    ],
    [
     220,
     300
    ],
    [
     450,
     300
    ],
    [
     450,
     120
    ],
    [
     700,
     120
    ],
    [
     700,
     390
    ],
    [
     940,
     390
    ]
   ],
   [
    [
     -30,
     470
    ],
    [
     110,
     470
    ],
    [
     110,
     380
    ],
    [
     450,
     380
    ],
    [
     450,
     300
    ],
    [
     700,
     300
    ],
    [
     700,
     390
    ],
    [
     940,
     390
    ]
   ]
  ],
  "pads": [
   [
    605,
    265
   ],
   [
    275,
    265
   ],
   [
    770,
    265
   ],
   [
    110,
    310
   ],
   [
    385,
    220
   ],
   [
    660,
    355
   ],
   [
    495,
    265
   ],
   [
    110,
    220
   ],
   [
    605,
    175
   ],
   [
    275,
    445
   ],
   [
    770,
    355
   ],
   [
    550,
    355
   ],
   [
    165,
    445
   ],
   [
    715,
    445
   ],
   [
    495,
    175
   ],
   [
    275,
    130
   ]
  ],
  "minions": [
   {
    "kind": "harvest_0",
    "name": "麦穗兵",
    "base": "pennantguard"
   },
   {
    "kind": "harvest_1",
    "name": "稻叶螳",
    "base": "swift"
   },
   {
    "kind": "harvest_2",
    "name": "田野雀",
    "base": "beaconkite"
   }
  ],
  "bosses": [
   {
    "kind": "harvest_boss_0",
    "name": "丰年谷主",
    "base": "bamboowitch"
   },
   {
    "kind": "harvest_boss_1",
    "name": "金穗灵牛",
    "base": "stonewarden"
   },
   {
    "kind": "harvest_boss_2",
    "name": "巡田羽侯",
    "base": "cloudboss"
   }
  ]
 },
 {
  "name": "残月孤城",
  "area": "月影城",
  "rounds": 18,
  "hp": 38,
  "ink": 550,
  "difficulty": 1.839,
  "intro": "月下潜行与换相轮番出现，混搭兵器和法术。",
  "theme": "moon",
  "night": true,
  "accent": "#9e9bb9",
  "color": "#303c4c",
  "mode": "single",
  "routes": [
   [
    [
     -30,
     440
    ],
    [
     310,
     440
    ],
    [
     310,
     110
    ],
    [
     120,
     110
    ],
    [
     120,
     260
    ],
    [
     610,
     260
    ],
    [
     610,
     80
    ],
    [
     800,
     80
    ],
    [
     800,
     390
    ],
    [
     940,
     390
    ]
   ]
  ],
  "pads": [
   [
    275,
    310
   ],
   [
    715,
    265
   ],
   [
    165,
    310
   ],
   [
    440,
    175
   ],
   [
    275,
    220
   ],
   [
    715,
    175
   ],
   [
    220,
    400
   ],
   [
    165,
    220
   ],
   [
    385,
    310
   ],
   [
    880,
    220
   ],
   [
    550,
    175
   ],
   [
    110,
    400
   ],
   [
    715,
    355
   ],
   [
    495,
    85
   ],
   [
    55,
    265
   ],
   [
    385,
    400
   ]
  ],
  "minions": [
   {
    "kind": "moon_0",
    "name": "月影客",
    "base": "frostshade"
   },
   {
    "kind": "moon_1",
    "name": "银蟾卫",
    "base": "tideclam"
   },
   {
    "kind": "moon_2",
    "name": "玄夜蝠",
    "base": "astralbat"
   }
  ],
  "bosses": [
   {
    "kind": "moon_boss_0",
    "name": "残月城主",
    "base": "moonsovereign"
   },
   {
    "kind": "moon_boss_1",
    "name": "孤城银卫",
    "base": "silencewarden"
   },
   {
    "kind": "moon_boss_2",
    "name": "夜幕鸮皇",
    "base": "thunderkite"
   }
  ]
 },
 {
  "name": "梅岭踏雪",
  "area": "寻梅径",
  "rounds": 18,
  "hp": 40,
  "ink": 560,
  "difficulty": 1.885,
  "intro": "梅岭双路夹击，破冰壳后再控制，门前预留补刀。",
  "theme": "plum",
  "night": false,
  "accent": "#b18d9b",
  "color": "#e9e7e9",
  "mode": "simultaneous",
  "routes": [
   [
    [
     120,
     -30
    ],
    [
     120,
     160
    ],
    [
     390,
     160
    ],
    [
     390,
     340
    ],
    [
     650,
     340
    ],
    [
     650,
     170
    ],
    [
     820,
     170
    ],
    [
     820,
     420
    ],
    [
     940,
     420
    ]
   ],
   [
    [
     120,
     550
    ],
    [
     120,
     400
    ],
    [
     280,
     400
    ],
    [
     280,
     260
    ],
    [
     520,
     260
    ],
    [
     520,
     460
    ],
    [
     820,
     460
    ],
    [
     820,
     420
    ],
    [
     940,
     420
    ]
   ]
  ],
  "pads": [
   [
    715,
    355
   ],
   [
    330,
    310
   ],
   [
    220,
    265
   ],
   [
    440,
    400
   ],
   [
    770,
    265
   ],
   [
    495,
    220
   ],
   [
    220,
    355
   ],
   [
    605,
    400
   ],
   [
    275,
    85
   ],
   [
    880,
    310
   ],
   [
    605,
    265
   ],
   [
    110,
    310
   ],
   [
    330,
    220
   ],
   [
    330,
    400
   ],
   [
    880,
    220
   ],
   [
    110,
    220
   ]
  ],
  "minions": [
   {
    "kind": "plum_0",
    "name": "梅枝灵",
    "base": "bamboodart"
   },
   {
    "kind": "plum_1",
    "name": "雪壳獾",
    "base": "frostcrab"
   },
   {
    "kind": "plum_2",
    "name": "梅羽鹊",
    "base": "hillkite"
   }
  ],
  "bosses": [
   {
    "kind": "plum_boss_0",
    "name": "梅岭雪君",
    "base": "frostlord"
   },
   {
    "kind": "plum_boss_1",
    "name": "凌寒花魁",
    "base": "dreamweaver"
   },
   {
    "kind": "plum_boss_2",
    "name": "丹羽霜凰",
    "base": "icephoenix"
   }
  ]
 },
 {
  "name": "长风驿路",
  "area": "逐风驿",
  "rounds": 18,
  "hp": 40,
  "ink": 560,
  "difficulty": 1.93,
  "intro": "长路追风，跃进与鼓舞叠出，减速截断冲锋。",
  "theme": "wind",
  "night": false,
  "accent": "#8ca18a",
  "color": "#e5e9df",
  "mode": "staggered",
  "routes": [
   [
    [
     -30,
     70
    ],
    [
     370,
     70
    ],
    [
     370,
     240
    ],
    [
     170,
     240
    ],
    [
     170,
     430
    ],
    [
     650,
     430
    ],
    [
     650,
     260
    ],
    [
     940,
     260
    ]
   ],
   [
    [
     -30,
     480
    ],
    [
     70,
     480
    ],
    [
     70,
     330
    ],
    [
     280,
     330
    ],
    [
     280,
     150
    ],
    [
     650,
     150
    ],
    [
     650,
     260
    ],
    [
     940,
     260
    ]
   ]
  ],
  "pads": [
   [
    330,
    310
   ],
   [
    605,
    265
   ],
   [
    220,
    175
   ],
   [
    110,
    220
   ],
   [
    715,
    310
   ],
   [
    495,
    265
   ],
   [
    110,
    400
   ],
   [
    715,
    220
   ],
   [
    220,
    490
   ],
   [
    440,
    85
   ],
   [
    110,
    130
   ],
   [
    715,
    130
   ],
   [
    605,
    355
   ],
   [
    110,
    490
   ],
   [
    440,
    355
   ],
   [
    770,
    400
   ]
  ],
  "minions": [
   {
    "kind": "wind_0",
    "name": "追风卒",
    "base": "tideskipper"
   },
   {
    "kind": "wind_1",
    "name": "风旗骑",
    "base": "hornacolyte"
   },
   {
    "kind": "wind_2",
    "name": "驿路隼",
    "base": "hillkite"
   }
  ],
  "bosses": [
   {
    "kind": "wind_boss_0",
    "name": "长风驿帅",
    "base": "embermarshal"
   },
   {
    "kind": "wind_boss_1",
    "name": "逐风天隼",
    "base": "thunderkite"
   },
   {
    "kind": "wind_boss_2",
    "name": "旋沙战骑",
    "base": "hillboss"
   }
  ]
 },
 {
  "name": "古琴幽谷",
  "area": "琴音谷",
  "rounds": 19,
  "hp": 40,
  "ink": 570,
  "difficulty": 1.976,
  "intro": "谷中琴音护送重阵，留意法术守卫与空中护援。",
  "theme": "music",
  "night": false,
  "accent": "#9c89aa",
  "color": "#e5e2e9",
  "mode": "single",
  "routes": [
   [
    [
     -30,
     150
    ],
    [
     250,
     150
    ],
    [
     250,
     390
    ],
    [
     470,
     390
    ],
    [
     470,
     110
    ],
    [
     720,
     110
    ],
    [
     720,
     310
    ],
    [
     940,
     310
    ]
   ]
  ],
  "pads": [
   [
    385,
    220
   ],
   [
    605,
    265
   ],
   [
    165,
    265
   ],
   [
    605,
    175
   ],
   [
    330,
    310
   ],
   [
    770,
    130
   ],
   [
    165,
    85
   ],
   [
    770,
    220
   ],
   [
    330,
    130
   ],
   [
    385,
    445
   ],
   [
    605,
    355
   ],
   [
    55,
    265
   ],
   [
    605,
    40
   ],
   [
    880,
    220
   ],
   [
    275,
    445
   ],
   [
    440,
    85
   ]
  ],
  "minions": [
   {
    "kind": "music_0",
    "name": "琴弦侍",
    "base": "ward"
   },
   {
    "kind": "music_1",
    "name": "鼓槌卫",
    "base": "ironvanguard"
   },
   {
    "kind": "music_2",
    "name": "音羽鹭",
    "base": "cloudmender"
   }
  ],
  "bosses": [
   {
    "kind": "music_boss_0",
    "name": "七弦琴尊",
    "base": "dreamweaver"
   },
   {
    "kind": "music_boss_1",
    "name": "鼓鸣石魁",
    "base": "drumking"
   },
   {
    "kind": "music_boss_2",
    "name": "清音羽灵",
    "base": "cloudwhale"
   }
  ]
 },
 {
  "name": "青瓷迷窑",
  "area": "瓷光窑",
  "rounds": 18,
  "hp": 40,
  "ink": 580,
  "difficulty": 1.915,
  "intro": "三道窑口轮换开启，机关、换相与碎镜合围。",
  "theme": "porcelain",
  "night": false,
  "accent": "#6e9d99",
  "color": "#dde9e6",
  "mode": "staggered",
  "routes": [
   [
    [
     -30,
     100
    ],
    [
     180,
     100
    ],
    [
     180,
     260
    ],
    [
     80,
     260
    ],
    [
     80,
     380
    ],
    [
     350,
     380
    ],
    [
     350,
     420
    ],
    [
     450,
     420
    ],
    [
     450,
     550
    ]
   ],
   [
    [
     930,
     100
    ],
    [
     720,
     100
    ],
    [
     720,
     260
    ],
    [
     820,
     260
    ],
    [
     820,
     380
    ],
    [
     550,
     380
    ],
    [
     550,
     420
    ],
    [
     450,
     420
    ],
    [
     450,
     550
    ]
   ],
   [
    [
     450,
     -30
    ],
    [
     450,
     150
    ],
    [
     320,
     150
    ],
    [
     320,
     70
    ],
    [
     580,
     70
    ],
    [
     580,
     290
    ],
    [
     450,
     290
    ],
    [
     450,
     550
    ]
   ]
  ],
  "pads": [
   [
    440,
    220
   ],
   [
    660,
    220
   ],
   [
    220,
    265
   ],
   [
    495,
    355
   ],
   [
    770,
    220
   ],
   [
    110,
    220
   ],
   [
    330,
    310
   ],
   [
    495,
    130
   ],
   [
    605,
    445
   ],
   [
    330,
    220
   ],
   [
    660,
    310
   ],
   [
    275,
    85
   ],
   [
    660,
    130
   ],
   [
    495,
    490
   ],
   [
    220,
    175
   ],
   [
    880,
    220
   ]
  ],
  "minions": [
   {
    "kind": "porcelain_0",
    "name": "瓷甲傀",
    "base": "gearroller"
   },
   {
    "kind": "porcelain_1",
    "name": "碎釉灵",
    "base": "mirrorguard"
   },
   {
    "kind": "porcelain_2",
    "name": "青瓷燕",
    "base": "mirrorbird"
   }
  ],
  "bosses": [
   {
    "kind": "porcelain_boss_0",
    "name": "窑光瓷尊",
    "base": "gearboss"
   },
   {
    "kind": "porcelain_boss_1",
    "name": "青釉镜君",
    "base": "mirrorqueen"
   },
   {
    "kind": "porcelain_boss_2",
    "name": "白瓷羽侯",
    "base": "glasswyrm"
   }
  ],
  "airRoutes": [
   [
    [
     -30,
     100
    ],
    [
     450,
     550
    ]
   ],
   [
    [
     930,
     100
    ],
    [
     450,
     550
    ]
   ],
   [
    [
     450,
     -30
    ],
    [
     700,
     250
    ],
    [
     450,
     550
    ]
   ]
  ]
 },
 {
  "name": "金阙云阶",
  "area": "金阙台",
  "rounds": 19,
  "hp": 42,
  "ink": 590,
  "difficulty": 2.022,
  "intro": "云阶双门齐进，厚甲与重建护盾守卫天阙。",
  "theme": "palace",
  "night": false,
  "accent": "#b29b63",
  "color": "#ece6d7",
  "mode": "simultaneous",
  "routes": [
   [
    [
     -30,
     70
    ],
    [
     300,
     70
    ],
    [
     300,
     220
    ],
    [
     120,
     220
    ],
    [
     120,
     430
    ],
    [
     580,
     430
    ],
    [
     580,
     260
    ],
    [
     940,
     260
    ]
   ],
   [
    [
     -30,
     480
    ],
    [
     400,
     480
    ],
    [
     400,
     100
    ],
    [
     710,
     100
    ],
    [
     710,
     430
    ],
    [
     820,
     430
    ],
    [
     820,
     260
    ],
    [
     940,
     260
    ]
   ]
  ],
  "pads": [
   [
    275,
    310
   ],
   [
    660,
    310
   ],
   [
    550,
    220
   ],
   [
    165,
    355
   ],
   [
    770,
    355
   ],
   [
    220,
    130
   ],
   [
    440,
    265
   ],
   [
    660,
    220
   ],
   [
    440,
    355
   ],
   [
    110,
    130
   ],
   [
    770,
    220
   ],
   [
    55,
    445
   ],
   [
    660,
    400
   ],
   [
    440,
    490
   ],
   [
    165,
    265
   ],
   [
    440,
    175
   ]
  ],
  "minions": [
   {
    "kind": "palace_0",
    "name": "金甲禁卫",
    "base": "armor"
   },
   {
    "kind": "palace_1",
    "name": "云阶侍",
    "base": "scrollguard"
   },
   {
    "kind": "palace_2",
    "name": "金翎鹤",
    "base": "cloudmender"
   }
  ],
  "bosses": [
   {
    "kind": "palace_boss_0",
    "name": "金阙帝卫",
    "base": "ironboss"
   },
   {
    "kind": "palace_boss_1",
    "name": "瑞云金凰",
    "base": "sunsovereign"
   },
   {
    "kind": "palace_boss_2",
    "name": "玉阶符尊",
    "base": "inkarchivist"
   }
  ]
 },
 {
  "name": "深渊星海",
  "area": "星渊海",
  "rounds": 19,
  "hp": 42,
  "ink": 600,
  "difficulty": 2.082,
  "intro": "深海三路轮袭，换相星侍与潮盾守护幽海巨鲸。",
  "theme": "abyss",
  "night": true,
  "accent": "#7ea8ba",
  "color": "#283b4b",
  "mode": "staggered",
  "routes": [
   [
    [
     -30,
     140
    ],
    [
     240,
     140
    ],
    [
     240,
     60
    ],
    [
     620,
     60
    ],
    [
     620,
     220
    ],
    [
     380,
     220
    ],
    [
     380,
     420
    ],
    [
     740,
     420
    ],
    [
     740,
     260
    ],
    [
     940,
     260
    ]
   ],
   [
    [
     100,
     550
    ],
    [
     100,
     330
    ],
    [
     280,
     330
    ],
    [
     280,
     470
    ],
    [
     570,
     470
    ],
    [
     570,
     340
    ],
    [
     740,
     340
    ],
    [
     740,
     260
    ],
    [
     940,
     260
    ]
   ],
   [
    [
     800,
     -30
    ],
    [
     800,
     120
    ],
    [
     500,
     120
    ],
    [
     500,
     280
    ],
    [
     170,
     280
    ],
    [
     170,
     400
    ],
    [
     380,
     400
    ],
    [
     380,
     420
    ],
    [
     740,
     420
    ],
    [
     740,
     260
    ],
    [
     940,
     260
    ]
   ]
  ],
  "pads": [
   [
    550,
    310
   ],
   [
    330,
    355
   ],
   [
    660,
    265
   ],
   [
    220,
    220
   ],
   [
    715,
    175
   ],
   [
    440,
    355
   ],
   [
    220,
    445
   ],
   [
    440,
    130
   ],
   [
    825,
    310
   ],
   [
    330,
    220
   ],
   [
    605,
    490
   ],
   [
    110,
    265
   ],
   [
    825,
    220
   ],
   [
    550,
    175
   ],
   [
    825,
    445
   ],
   [
    660,
    85
   ]
  ],
  "minions": [
   {
    "kind": "abyss_0",
    "name": "星砂侍",
    "base": "astral"
   },
   {
    "kind": "abyss_1",
    "name": "深渊螺",
    "base": "tideshaper"
   },
   {
    "kind": "abyss_2",
    "name": "幽蓝鳐",
    "base": "duskwing"
   }
  ],
  "bosses": [
   {
    "kind": "abyss_boss_0",
    "name": "星渊潮主",
    "base": "tideboss"
   },
   {
    "kind": "abyss_boss_1",
    "name": "幽海星鲸",
    "base": "cloudwhale"
   },
   {
    "kind": "abyss_boss_2",
    "name": "螺旋渊卫",
    "base": "pendulumlord"
   }
  ],
  "airRoutes": [
   [
    [
     -30,
     140
    ],
    [
     940,
     260
    ]
   ],
   [
    [
     100,
     550
    ],
    [
     940,
     260
    ]
   ],
   [
    [
     800,
     -30
    ],
    [
     370,
     220
    ],
    [
     940,
     260
    ]
   ]
  ]
 },
 {
  "name": "山河会盟",
  "area": "盟誓关",
  "rounds": 18,
  "hp": 42,
  "ink": 620,
  "difficulty": 2.143,
  "intro": "三支盟军同时进攻，分散布防，先拆支援兵。",
  "theme": "alliance",
  "night": false,
  "accent": "#9c8766",
  "color": "#e5e0d6",
  "mode": "simultaneous",
  "routes": [
   [
    [
     -30,
     100
    ],
    [
     300,
     100
    ],
    [
     300,
     250
    ],
    [
     100,
     250
    ],
    [
     100,
     420
    ],
    [
     320,
     420
    ],
    [
     320,
     330
    ],
    [
     450,
     330
    ],
    [
     450,
     550
    ]
   ],
   [
    [
     930,
     100
    ],
    [
     600,
     100
    ],
    [
     600,
     250
    ],
    [
     800,
     250
    ],
    [
     800,
     420
    ],
    [
     580,
     420
    ],
    [
     580,
     330
    ],
    [
     450,
     330
    ],
    [
     450,
     550
    ]
   ],
   [
    [
     450,
     -30
    ],
    [
     450,
     140
    ],
    [
     320,
     140
    ],
    [
     320,
     60
    ],
    [
     650,
     60
    ],
    [
     650,
     280
    ],
    [
     450,
     280
    ],
    [
     450,
     550
    ]
   ]
  ],
  "pads": [
   [
    495,
    175
   ],
   [
    275,
    355
   ],
   [
    495,
    400
   ],
   [
    770,
    175
   ],
   [
    385,
    220
   ],
   [
    165,
    175
   ],
   [
    660,
    355
   ],
   [
    385,
    400
   ],
   [
    275,
    40
   ],
   [
    715,
    40
   ],
   [
    550,
    490
   ],
   [
    165,
    310
   ],
   [
    330,
    490
   ],
   [
    55,
    265
   ],
   [
    880,
    265
   ],
   [
    165,
    40
   ]
  ],
  "minions": [
   {
    "kind": "alliance_0",
    "name": "盟旗卫",
    "base": "beaconguard"
   },
   {
    "kind": "alliance_1",
    "name": "铁誓骑",
    "base": "gearroller"
   },
   {
    "kind": "alliance_2",
    "name": "烽盟鹰",
    "base": "beaconkite"
   }
  ],
  "bosses": [
   {
    "kind": "alliance_boss_0",
    "name": "山河盟主",
    "base": "embermarshal"
   },
   {
    "kind": "alliance_boss_1",
    "name": "誓阵玄将",
    "base": "silencewarden"
   },
   {
    "kind": "alliance_boss_2",
    "name": "征云战凰",
    "base": "cloudboss"
   }
  ],
  "airRoutes": [
   [
    [
     -30,
     100
    ],
    [
     260,
     80
    ],
    [
     450,
     550
    ]
   ],
   [
    [
     930,
     100
    ],
    [
     640,
     80
    ],
    [
     450,
     550
    ]
   ],
   [
    [
     450,
     -30
    ],
    [
     700,
     240
    ],
    [
     450,
     550
    ]
   ]
  ]
 },
 {
  "name": "万卷终章",
  "area": "归藏天阙",
  "rounds": 20,
  "hp": 42,
  "ink": 640,
  "difficulty": 2.219,
  "intro": "三门汇入归藏天阙，护盾、换相与空军压境。",
  "theme": "summit",
  "night": true,
  "accent": "#baa77b",
  "color": "#343a50",
  "mode": "simultaneous",
  "routes": [
   [
    [
     180,
     -30
    ],
    [
     180,
     170
    ],
    [
     400,
     170
    ],
    [
     400,
     70
    ],
    [
     720,
     70
    ],
    [
     720,
     440
    ],
    [
     520,
     440
    ],
    [
     520,
     290
    ],
    [
     250,
     290
    ],
    [
     250,
     410
    ],
    [
     70,
     410
    ],
    [
     70,
     260
    ],
    [
     -30,
     260
    ]
   ],
   [
    [
     180,
     550
    ],
    [
     180,
     410
    ],
    [
     400,
     410
    ],
    [
     400,
     320
    ],
    [
     650,
     320
    ],
    [
     650,
     180
    ],
    [
     520,
     180
    ],
    [
     520,
     290
    ],
    [
     250,
     290
    ],
    [
     250,
     410
    ],
    [
     70,
     410
    ],
    [
     70,
     260
    ],
    [
     -30,
     260
    ]
   ],
   [
    [
     940,
     260
    ],
    [
     810,
     260
    ],
    [
     810,
     120
    ],
    [
     630,
     120
    ],
    [
     630,
     240
    ],
    [
     400,
     240
    ],
    [
     400,
     120
    ],
    [
     90,
     120
    ],
    [
     90,
     260
    ],
    [
     -30,
     260
    ]
   ]
  ],
  "pads": [
   [
    220,
    265
   ],
   [
    550,
    130
   ],
   [
    330,
    220
   ],
   [
    770,
    265
   ],
   [
    110,
    310
   ],
   [
    440,
    175
   ],
   [
    605,
    355
   ],
   [
    330,
    355
   ],
   [
    770,
    175
   ],
   [
    440,
    355
   ],
   [
    55,
    445
   ],
   [
    55,
    175
   ],
   [
    770,
    85
   ],
   [
    330,
    445
   ],
   [
    275,
    85
   ],
   [
    220,
    445
   ]
  ],
  "minions": [
   {
    "kind": "summit_0",
    "name": "经卷守卫",
    "base": "scrollguard"
   },
   {
    "kind": "summit_1",
    "name": "归藏星侍",
    "base": "astral"
   },
   {
    "kind": "summit_2",
    "name": "天阙墨鹤",
    "base": "astralbat"
   }
  ],
  "bosses": [
   {
    "kind": "summit_boss_0",
    "name": "万卷墨尊",
    "base": "astralboss"
   },
   {
    "kind": "summit_boss_1",
    "name": "山海归灵",
    "base": "stonewarden"
   },
   {
    "kind": "summit_boss_2",
    "name": "诗天云凰",
    "base": "sunsovereign"
   }
  ],
  "airRoutes": [
   [
    [
     180,
     -30
    ],
    [
     630,
     220
    ],
    [
     -30,
     260
    ]
   ],
   [
    [
     180,
     550
    ],
    [
     510,
     290
    ],
    [
     -30,
     260
    ]
   ],
   [
    [
     940,
     260
    ],
    [
     -30,
     260
    ]
   ]
  ]
 }
];
export const CAMPAIGN_VOLUMES=[{name:'初识山河',intro:'青山启程，学会组词与布阵。',start:0,end:10},{name:'行遍四时',intro:'从桃源到龙门，迎战各地守将。',start:10,end:20},{name:'万卷归藏',intro:'秋野、星海与天阙，守住最后一卷。',start:20,end:30}];
export function createCampaignEnemies(base){
 const enemies={};
 for(const [index,ch]of CAMPAIGN_ADDITIONS.entries())for(const [boss,entries]of [[false,ch.minions],[true,ch.bosses]])for(const [slot,entry]of entries.entries()){
  const original=base[entry.base],data=structuredClone(original);
  // Keep a concrete, non-recursive source for portraits and all passive combat behavior.
  if(!boss){data.sprite=original.sprite||entry.base;data.behavior=original.behavior||entry.base;data.trim=original.trim||['leaves','shield','gust'][slot];}
  else {data.portraitUnit=original.portraitUnit||({hillboss:'hillrunner',tideboss:'tideshaper',cloudboss:'cloudraptor',gearboss:'clockwork',frostlord:'frostbeast',mirrorqueen:'mirrorling',astralboss:'astral',ironboss:'armor'}[entry.base]||'tank');data.ornament=original.ornament||['tree','armor','lightning'][slot];data.behavior=original.behavior||entry.base;}
  data.campaignBase=entry.base;data.name=entry.name;data.color=ch.accent;data.campaignTheme=ch.theme;data.icon=entry.name[0];data.sigil=entry.name[0];
  // Small individual variations, without compounding a second chapter-level multiplier.
  data.hp=Math.round(original.hp*(1+(index%4)*.015+slot*.01));
  data.speed=+(original.speed*(1+(index%3-slot)*.012)).toFixed(2);
  if(boss){
   data.reward=28;data.harm=Math.max(4,original.harm);
   if(/金乌|金凰|云凰/.test(entry.name)){data.air=true;data.portraitUnit='cloudraptor';}
   const local=unit=>{if(['small','normal','flying','armor','swift'].includes(unit))return unit;const candidate=ch.minions.find(m=>(base[m.base].behavior||m.base)===(base[unit].behavior||unit))||ch.minions[0];data.desc=data.desc.replaceAll(base[unit].name,candidate.name);return candidate.kind;};
   if(data.pulse?.kind==='summon')data.pulse.unit=local(data.pulse.unit);
   if(data.phase?.summon)data.phase.summon=local(data.phase.summon);
  }
  data.role=original.role||({'healer':'限次急救','ward':'法术护援','tideshaper':'潮盾护送','hillrunner':'跳跃突进','cloudraptor':'空中俯冲','armor':'装甲推进','swift':'快速冲锋','scrollguard':'重建护盾','astral':'兵法换相'}[data.behavior])||'特色守卫';
  enemies[entry.kind]=data;
 }
 return enemies;
}
