// Paper-cut scenery, deliberately quiet behind routes, towers and projectiles.
const GLYPHS={peach:'花',lotus:'荷',rain:'雨',desert:'沙',cliff:'崖',temple:'禅',lantern:'灯',ocean:'潮',forge:'炉',waterfall:'瀑',harvest:'禾',moon:'月',plum:'梅',wind:'风',music:'琴',porcelain:'瓷',palace:'阙',abyss:'渊',alliance:'盟',summit:'卷'};
export function drawCampaignEmblem(ctx,theme,color,scale=1){
 ctx.save();ctx.translate(0,-27*scale);ctx.scale(scale,scale);ctx.fillStyle='#f5efd9';ctx.strokeStyle=color;ctx.lineWidth=1.3;
 ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=color;ctx.font='bold 10px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(GLYPHS[theme]||'墨',0,.5);ctx.restore();
}
export function drawCampaignBackdrop(ctx,map,time=0){
 const theme=map.theme,color=map.accent,night=map.night;
 ctx.save();ctx.globalAlpha=night?.35:.26;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;
 const line=pts=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
 const oval=(x,y,a,b,fill=true)=>{ctx.beginPath();ctx.ellipse(x,y,a,b,0,0,Math.PI*2);fill?ctx.fill():ctx.stroke();};
 const disk=(x,y,r)=>oval(x,y,r,r);
 const flower=(x,y,r=9)=>{for(let k=0;k<5;k++){const a=k*Math.PI*.4;oval(x+Math.cos(a)*r,y+Math.sin(a)*r,r*.65,r*.55);}ctx.save();ctx.fillStyle='#f7efcc';disk(x,y,3);ctx.restore();};
 const tree=(x,y,blossom=false)=>{line([[x,y],[x-5,y-100],[x+18,y-135]]);line([[x-3,y-65],[x-32,y-105],[x-55,y-108]]);line([[x-2,y-86],[x+35,y-108],[x+53,y-103]]);for(const [dx,dy]of[[-47,-111],[-28,-105],[14,-136],[36,-111],[49,-103],[-5,-92]])blossom?flower(x+dx,y+dy,7):oval(x+dx,y+dy,18,9);};
 const waves=(y,count=5)=>{for(let k=0;k<count;k++){ctx.beginPath();ctx.moveTo(-20,y+k*15);ctx.bezierCurveTo(220,y-40+k*15,600,y+65+k*15,930,y+k*15);ctx.stroke();}};
 const roof=(x,y,size=1)=>{line([[x-45*size,y],[x,y-24*size],[x+45*size,y]]);ctx.strokeRect(x-31*size,y,62*size,32*size);line([[x-51*size,y+34*size],[x+51*size,y+34*size]]);};
 const stars=(n=45)=>{for(let i=0;i<n;i++)disk((i*137+39)%900,(i*83+17)%520,i%5?1:2.5);};
 const banner=(x,y)=>{line([[x,y+45],[x,y-42]]);ctx.beginPath();ctx.moveTo(x,y-42);ctx.lineTo(x+38,y-30);ctx.lineTo(x+21,y-20);ctx.lineTo(x+38,y-7);ctx.lineTo(x,y-13);ctx.closePath();ctx.fill();};
 if(theme==='peach'){tree(70,190,true);tree(805,480,true);for(let i=0;i<26;i++)oval((i*153+35)%900,(i*71+20)%520,4,2);waves(470,2);}
 if(theme==='lotus'){waves(295,6);for(const [x,y]of[[60,460],[420,70],[810,380],[540,470]]){oval(x,y,35,11);line([[x,y],[x,y-39]]);flower(x,y-45,11);}}
 if(theme==='rain'){for(let i=0;i<60;i++){const x=(i*139)%920,y=(i*67)%520;line([[x,y],[x-9,y+27]]);}roof(740,460,1.2);tree(65,190,true);}
 if(theme==='desert'){for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-30,100+i*95);ctx.bezierCurveTo(200,-20+i*95,600,240+i*65,950,80+i*95);ctx.stroke();}for(const [x,y]of[[80,200],[830,95],[510,480]]){ctx.fillRect(x,y,25,45);line([[x-5,y],[x+30,y]]);}disk(810,45,27);}
 if(theme==='cliff'){for(const [x,y]of[[40,260],[840,490],[510,80]]){ctx.beginPath();ctx.moveTo(x-100,y+90);ctx.lineTo(x-40,y-100);ctx.lineTo(x+15,y-130);ctx.lineTo(x+65,y+90);ctx.fill();line([[x-20,y-90],[x-5,y+45]]);}line([[0,485],[900,485]]);}
 if(theme==='temple'){roof(470,75,1.4);roof(470,43,.9);tree(50,360);tree(830,490);for(const x of [300,370,570,640]){ctx.fillRect(x,470,16,24);disk(x+8,468,13);}}
 if(theme==='lantern'){stars(20);for(let i=0;i<8;i++){const x=50+i*115,y=35+(i%2)*38;line([[x,0],[x,y]]);oval(x,y+15,14,20);line([[x,y+36],[x,y+49]]);}roof(780,490);}
 if(theme==='ocean'){waves(60,5);waves(420,5);for(const [x,y]of[[100,300],[780,160]]){line([[x-32,y+15],[x+32,y+15],[x+17,y+30],[x-17,y+30],[x-32,y+15]]);line([[x,y+15],[x,y-55],[x+28,y+1],[x,y+1]]);}}
 if(theme==='forge'){for(const [x,y]of[[110,470],[780,80],[430,460]]){ctx.strokeRect(x-30,y-45,60,50);oval(x,y-45,34,11,false);line([[x-35,y+13],[x+35,y+13]]);for(let k=-1;k<=1;k++)line([[x+k*13,y-60],[x+k*13-7,y-80],[x+k*13+3,y-100]]);}for(let i=0;i<30;i++)disk((i*173)%900,(i*91)%520,2);}
 if(theme==='waterfall'){for(let i=0;i<8;i++){ctx.beginPath();ctx.moveTo(820+i*8,0);ctx.bezierCurveTo(790+i*8,180,840+i*8,330,790+i*8,520);ctx.stroke();}waves(470,3);for(const y of [100,320]){oval(820,y,60,14);}}
 if(theme==='harvest'){for(let i=0;i<18;i++){const x=30+i*50,y=i%2?490:65;line([[x,y+20],[x,y-18]]);for(let k=0;k<3;k++){oval(x-5,y-k*8,5,3);oval(x+5,y-k*8-3,5,3);}}roof(810,210);}
 if(theme==='moon'){stars();ctx.save();ctx.fillStyle='#ede4bf';disk(790,60,37);ctx.fillStyle=map.color;disk(805,51,34);ctx.restore();for(const x of [60,430,840])roof(x,490,.9);}
 if(theme==='plum'){tree(70,190,true);tree(815,490,true);ctx.save();ctx.fillStyle='#ffffff';for(let i=0;i<55;i++)disk((i*127+25)%900,(i*77+5)%520,2);ctx.restore();}
 if(theme==='wind'){for(let k=0;k<8;k++){const y=30+k*69;ctx.beginPath();ctx.moveTo(20,y);ctx.bezierCurveTo(270,y-30,600,y+25,880,y-15);ctx.stroke();}for(const [x,y]of[[85,80],[820,480]]){line([[x,y+30],[x,y-30]]);ctx.strokeRect(x-25,y-20,50,20);}}
 if(theme==='music'){for(const [x,y]of[[120,75],[790,450]]){ctx.save();ctx.translate(x,y);ctx.rotate(-.25);ctx.strokeRect(-70,-18,140,36);for(let k=0;k<7;k++)line([[-65,-13+k*4],[65,-13+k*4]]);ctx.restore();}for(let k=0;k<3;k++)oval(450,280,110+k*45,50+k*23,false);tree(55,430);}
 if(theme==='porcelain'){for(const [x,y]of[[80,90],[810,450],[450,480]]){ctx.beginPath();ctx.moveTo(x-12,y-45);ctx.bezierCurveTo(x-8,y-5,x-45,y-5,x-30,y+28);ctx.quadraticCurveTo(x,y+39,x+30,y+28);ctx.bezierCurveTo(x+45,y-5,x+8,y-5,x+12,y-45);ctx.closePath();ctx.stroke();oval(x,y-45,14,3,false);line([[x-25,y+7],[x+25,y+7]]);flower(x,y-5,6);}}
 if(theme==='palace'){for(const y of [40,480]){roof(450,y,1.5);for(const x of [60,180,720,840]){ctx.fillRect(x,y,9,37);disk(x+4,y-4,7);}}ctx.strokeRect(25,25,850,470);}
 if(theme==='abyss'){stars(65);for(let k=0;k<5;k++)oval(450,260,140+k*47,80+k*24,false);for(const x of [80,820]){line([[x,500],[x-15,460],[x-30,440]]);line([[x-12,470],[x+18,430]]);}}
 if(theme==='alliance'){for(const [x,y]of[[55,70],[450,50],[840,480]])banner(x,y);for(let k=0;k<5;k++)line([[0,490+k*5],[900,490+k*5]]);roof(820,70,.8);}
 if(theme==='summit'){stars(70);for(const [x,y]of[[60,60],[790,470]]){ctx.strokeRect(x-35,y-15,70,35);for(const dx of [-40,40]){line([[x+dx,y-23],[x+dx,y+27]]);disk(x+dx,y-23,4);}for(let i=-2;i<=2;i++)line([[x+i*10,y-6],[x+i*10,y+10]]);}for(let k=0;k<3;k++)oval(450,260,120+k*70,70+k*40,false);roof(450,40);}
 ctx.restore();
}
